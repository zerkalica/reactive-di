// @flow

import type {ISource, INotifier, IAsyncValue} from './interfaces'

export default class SourceObservable<V: Object, M> {
    displayName: string
    id: number

    _subscription: ?Subscription = null
    _isCanceled: boolean
    _atom: ISource<V, M>
    _notifier: INotifier

    constructor(some: IAsyncValue<M>, atom: ISource<V, M>, prefix: string, notifier: INotifier) {
        this.displayName = atom.displayName + '.' + prefix
        this.id = ++notifier.opId
        this._notifier = notifier
        this._atom = atom
        if (typeof some.subscribe === 'function') {
            this._subscription = ((some: any): Observable<M, Error>)
                .subscribe((this: Observer<M, Error>))
        } else {
            const complete = (v: M) => this.complete(v)
            const error = (e: Error) => this.error(e)
            ;((some: any): Promise<M>)
                .then(complete)
                .catch(error)
        }

        const oldId = this._notifier.begin(this.displayName, this.id)
        atom.pend(true)
        this._notifier.end(oldId)
    }

    abort() {
        this._isCanceled = true
        if (this._subscription) {
            this._subscription.unsubscribe()
            this._subscription = null
        }
    }

    next(v?: M) {
        if (!v || this._isCanceled) {
            return
        }
        const oldId = this._notifier.begin(this.displayName, this.id)
        this._atom.set(v, true)
        this._notifier.end(oldId)
    }

    error(e: Error) {
        if (this._isCanceled) {
            return
        }
        const oldId = this._notifier.begin(this.displayName, this.id)
        this._atom.error(e)
        this._notifier.end(oldId)
    }

    complete(v?: M) {
        if (this._isCanceled) {
            return
        }
        const oldId = this._notifier.begin(this.displayName, this.id)
        this._atom.set(v, true)
        this._atom.pend(false)
        this._notifier.end(oldId)
    }
}
