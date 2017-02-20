// @flow

import Err from 'es6-error'

import type {INotifier} from '../hook/interfaces'

import type {
    IUpdater,
    IControllable,
    ISource
} from './interfaces'

const completeObj = {complete: true, pending: false, error: null, promise: null}

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

    retry = () => {
        this._controllable.run()
    }

    abort = () => {
        this._controllable.abort()
    }
}

export default class Updater<V: Object> implements IControllable {
    displayName: string

    _source: ISource<V>
    _updater: IUpdater<V>
    _notifier: INotifier
    _isCanceled: boolean

    _id: number
    _subscription: ?Subscription
    _v: V

    constructor(
        updater: IUpdater<V>,
        source: ISource<V>,
        notifier: INotifier
    ) {
        this._source = source
        this._updater = updater
        this._notifier = notifier
        this._isCanceled = false
        this._v = (null: any)
        this.displayName = source.displayName
        this._id = ++notifier.opId
    }

    run(): void {
        const updater = this._updater
        const status = this._source.getStatus()
        const pending = {
            complete: false,
            pending: true,
            error: null
        }
        if (updater.promise) {
            const complete = (v: V) => this.complete(v)
            const error = (e: Error) => this.error(e)
            updater.promise()
                .then(complete)
                .catch(error)

            status.merge(pending)
        } else if (updater.observable) {
            status.merge(pending)
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
        notifier.trace = this.displayName + '.next'
        const oldId = notifier.opId
        notifier.opId = this._id
        const source = this._source
        source.merge(v)
        const observer = this._updater
        if (observer && observer.next) {
            observer.next(v)
        }
        notifier.opId = oldId
        notifier.trace = oldTrace
        notifier.flush()
        this._v = v
    }

    error(e: Error): void {
        if (this._isCanceled) {
            return
        }
        const error = new RecoverableError(e, (this: IControllable))
        const notifier = this._notifier
        const oldTrace = notifier.trace
        notifier.trace = this.displayName + '.error'
        const oldId = notifier.opId
        notifier.opId = this._id
        notifier.onError(error, this._source.displayName)
        const status = this._source.getStatus()
        const statusValue = status.cached || status.get()
        status.merge({error, complete: false, pending: false, promise: null})
        const observer = this._updater
        if (observer && observer.error) {
            observer.error(error)
        }
        statusValue._reject(error)
        notifier.opId = oldId
        notifier.trace = oldTrace
        notifier.flush()
    }

    complete(v: ?V): void {
        if (this._isCanceled) {
            return
        }
        const notifier = this._notifier
        const oldTrace = notifier.trace
        notifier.trace = this.displayName + '.complete'
        const oldId = notifier.opId
        notifier.opId = this._id
        const source = this._source
        const status = source.getStatus()
        const statusValue = status.cached || status.get()

        status.merge(completeObj)
        if (v) {
            this._source.merge(v)
        }
        const observer = this._updater
        if (observer && observer.complete) {
            observer.complete(v)
        }
        statusValue._resolve(v || this._v)
        notifier.opId = oldId
        notifier.trace = oldTrace
        notifier.flush()
    }
}
