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
        this.displayName = this._notifier.trace
        //  + source.displayName
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

        const some: Promise<V> | Observable<V, Error> = updater.run()

        if (typeof some.subscribe === 'function') {
            status.merge(pending)
            this._subscription = ((some: any): Observable<V, Error>)
                .subscribe((this: Observer<V, Error>))
        } else {
            const complete = (v: V) => this.complete(v)
            const error = (e: Error) => this.error(e)
            ;((some: any): Promise<V>)
                .then(complete)
                .catch(error)

            status.merge(pending)
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
            if (this._updater.noPut) {
                source.push(v)
            } else {
                source.merge(v)
            }
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
        this._status.merge({error, complete: false, pending: false})
        const observer = this._updater
        if (observer && observer.error) {
            observer.error(error)
        }
        this._promisable.reject(error)
        notifier.onError(error, this._source.displayName, true)
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

        const observer = this._updater
        if (observer && observer.complete) {
            observer.complete(v || this._v)
        }
        if (v) {
            if (this._updater.noPut) {
                source.push(v)
            } else {
                source.merge(v)
            }
        }
        this._status.reset()
        this._promisable.resolve(v || this._v)
        notifier.opId = oldId
        notifier.trace = oldTrace
        notifier.flush()
    }
}
