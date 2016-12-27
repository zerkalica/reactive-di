// @flow

import Err from 'es6-error'

import type {ISettable, ISource, ISourceStatus, INotifier} from '../atoms/interfaces'
import {setterKey} from '../atoms/interfaces'

const completeObj = {complete: true, pending: false, error: null}
const pendingObj = {complete: false, pending: true, error: null}


interface IControllable {
    run(): void;
    abort(): void;
}

export class RecoverableError extends Err {
    orig: Error
    _controllable: IControllable

    constructor(
        orig: Error,
        controllable: IControllable
    ) {
        super(orig.message)
        this.stack = orig.stack
        this.orig = orig
        this._controllable = controllable
    }

    retry(): void {
        this._controllable.run()
    }

    abort(): void {
        this._controllable.abort()
    }
}

type IUpdaterBase<V> = {
    value: V;
    next?: (v: V) => void;
    complete?: (v: ?V) => void;
    error?: (e: Error) => void;
}
export type IUpdater<V> = IUpdaterBase<V> & {
    promise: () => Promise<V>;
}


export default class Updater<V> {
    _source: ISettable<V>
    _status: ISettable<ISourceStatus>
    _updater: IUpdater<V>
    _notifier: INotifier
    _isCanceled: boolean

    _trace: string
    _subscription: ?Subscription
    _id: number
    constructor(updater: $Supertype<IUpdater<V>>) {
        const source: ISource<V> = this._source = (updater.value: any)[setterKey]
        const status: ISettable<ISourceStatus> = source.getStatus()

        this._source = source
        this._status = status
        this._updater = updater
        this._notifier = source.context.notifier
        this._isCanceled = false
    }

    run(): void {
        const updater = this._updater
        this._trace = this._notifier.trace
        this._id = this._notifier.callerId
        if (updater.promise) {
            this._status.merge(pendingObj)
            const complete = (v: V) => this.complete(v)
            const error = (e: Error) => this.error(e)
            updater.promise()
                .then(complete)
                .catch(error)
        } else if (updater.observable) {
            this._status.merge(pendingObj)
            this._subscription = updater.observable()
                .subscribe((this: Observer<V, Error>))
        }
    }

    abort(): void {
        this._isCanceled = true
        if (this._subscription) {
            this._subscription.unsubscribe()
            this._subscription = null
        }
    }

    next(v: V): void {
        if (this._isCanceled) {
            return
        }
        const notifier = this._notifier
        const oldTrace = notifier.trace
        const oldId = notifier.callerId
        notifier.trace = this._trace
        notifier.asyncType = 'next'
        notifier.callerId = this._id
        this._source.merge(v)
        const observer = this._updater
        if (observer && observer.next) {
            observer.next(v)
        }
        notifier.asyncType = null
        notifier.trace = oldTrace
        notifier.callerId = oldId
        notifier.end()
    }

    error(e: Error): void {
        if (this._isCanceled) {
            return
        }
        const error = new RecoverableError(e, (this: IControllable))
        const notifier = this._notifier
        const oldTrace = notifier.trace
        const oldId = notifier.callerId
        notifier.trace = this._trace
        notifier.asyncType = 'error'
        notifier.callerId = this._id
        this._status.merge({error, complete: false, pending: false})
        const observer = this._updater
        if (observer && observer.error) {
            observer.error(error)
        }
        notifier.asyncType = null
        notifier.trace = oldTrace
        notifier.callerId = oldId
        notifier.end()
    }

    complete(v: ?V): void {
        if (this._isCanceled) {
            return
        }
        // this.abort()
        const notifier = this._notifier
        const oldTrace = notifier.trace
        const oldId = notifier.callerId
        notifier.trace = this._trace
        notifier.callerId = this._id
        notifier.asyncType = 'complete'
        this._status.merge(completeObj)
        if (v) {
            this._source.merge(v)
        }
        const observer = this._updater
        if (observer && observer.complete) {
            observer.complete(v)
        }
        notifier.asyncType = null
        notifier.trace = oldTrace
        notifier.callerId = oldId
        notifier.end()
    }
}
