// @flow

import Err from 'es6-error'

import type {INotifier} from '../hook/interfaces'

import type {
    ISourceStatus,
    IUpdater,
    IControllable,
    ISource,
    IPromisable
} from './interfaces'

const completeObj = {complete: true, pending: false, error: null}

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
    _status: ISource<ISourceStatus>
    _updater: IUpdater<V>
    _notifier: INotifier
    _isCanceled: boolean

    _id: number
    _subscription: ?Subscription
    _v: V
    _promisable: IPromisable<V>

    constructor(
        updater: IUpdater<V>,
        source: ISource<V>,
        status: ISource<ISourceStatus>,
        promisable: IPromisable<V>,
        notifier: INotifier
    ) {
        this._source = source
        this._status = status
        this._notifier = notifier
        this._updater = updater
        this._promisable = promisable
        this._isCanceled = false
        this._v = (null: any)
        this.displayName = source.displayName
        this._id = ++this._notifier.opId
    }

    run(): void {
        const updater = this._updater
        const status = this._status
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
                .subscribe((this: Observer<?V, Error>))
        }
    }

    abort(): void {
        this._isCanceled = true
        if (this._subscription) {
            this._subscription.unsubscribe()
            this._subscription = null
        }
    }

    next(v: ?V): void {
        if (this._isCanceled) {
            return
        }
        const notifier = this._notifier
        const oldTrace = notifier.trace
        notifier.trace = this.displayName + '.next'
        const oldId = notifier.opId
        notifier.opId = this._id
        const source = this._source
        const observer = this._updater
        if (v) {
            source.merge(v)
            if (observer && observer.next) {
                observer.next(v)
            }
            this._v = v
        }
        notifier.opId = oldId
        notifier.trace = oldTrace
        notifier.flush()
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
        this._status.merge({error, complete: false, pending: false})
        const observer = this._updater
        if (observer && observer.error) {
            observer.error(error)
        }
        this._promisable.reject(error)
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
        const status = this._status

        status.merge(completeObj)
        if (v) {
            source.merge(v)
        }
        const observer = this._updater
        if (observer && observer.complete) {
            observer.complete(v)
        }
        this._promisable.resolve(v || this._v)
        notifier.opId = oldId
        notifier.trace = oldTrace
        notifier.flush()
    }
}
