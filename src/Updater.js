// @flow
import type {Key} from './interfaces/deps'
import type {Adapter, Atom, Derivable} from './interfaces/atom'

import Di from './Di'
import promiseToObservable from './utils/promiseToObservable'
import debugName from './utils/debugName'
import {RdiMeta, deps} from './annotations'

export type KeyValueSyncUpdate = [Key, mixed]
export type SyncUpdate = KeyValueSyncUpdate | Object
export type AsyncUpdate = Promise<SyncUpdate[]> | Observable<SyncUpdate[], Error>
export type AsyncUpdateThunk = () => AsyncUpdate
export type Transaction = SyncUpdate | AsyncUpdateThunk
export type AsyncErrorResult = {
    type: 'error';
    error: Error;
    retry(): void;
}
export type UpdaterStatus = {
    type: 'pending';
}
| {
    type: 'complete';
}
| AsyncErrorResult

function noop() {}

class OperationObserver {
    _parentObserver: Observer<Transaction[], AsyncErrorResult>;
    _unsubscribe: () => void;
    _cancel: () => void;

    constructor(
        parentObserver: Observer<Transaction[], AsyncErrorResult>,
        unsubscribe: () => void,
        cancel: () => void
    ) {
        this._parentObserver = parentObserver
        this._unsubscribe = unsubscribe
        this._cancel = cancel
    }

    next(ops: ?SyncUpdate[]): void {
        if (ops) {
            this._parentObserver.next(ops)
        }
    }

    error(err: Error): void {
        this._unsubscribe()
        this._cancel()
        this._parentObserver.error({
            type: 'error',
            error: err,
            retry: noop
        })
    }

    complete(ops?: SyncUpdate[]): void {
        this._unsubscribe()
        this._parentObserver.complete(ops)
    }
}

class AsyncQeue {
    _maxQeueSize: number;
    _qeue: AsyncUpdateThunk[] = [];
    _subscriptions: Subscription[] = [];
    _parentObserver: Observer<Transaction[], AsyncErrorResult>;

    // Readonly qeue size
    size: number = 0;

    constructor(
        parentObserver: Observer<Transaction[], AsyncErrorResult>,
        maxQeueSize: number = 1
    ) {
        this._maxQeueSize = maxQeueSize
        this._parentObserver = parentObserver
    }

    add(ops: AsyncUpdateThunk[]): void {
        this._qeue = this._qeue.concat(ops)
        this.size = this.size + ops.length
        this._run()
    }

    _run(): void {
        if (this.size === 0) {
            this._parentObserver.complete()
            return
        }
        if (this._subscriptions.length >= this._maxQeueSize) {
            return
        }
        const op: AsyncUpdateThunk = this._qeue.pop()

        let observable: Observable<SyncUpdate[], Error>
        const update: AsyncUpdate = op()
        if (update.then) {
            observable = promiseToObservable(((update: any): Promise<SyncUpdate[]>))
        } else if (update.subscribe) {
            observable = ((update: any): Observable<SyncUpdate[], Error>)
        } else {
            throw new Error(`Unknown operation: ${debugName(op)}`)
        }

        let subscription: Subscription;
        const observer: Observer<SyncUpdate[], Error> = new OperationObserver(
            this._parentObserver,
            () => this._removeSubscription(subscription),
            () => this._cancel()
        )

        subscription = observable.subscribe(observer)
        this._subscriptions.push(subscription)
    }

    _removeSubscription(item: Subscription): void {
        this.size = this.size - 1
        this._subscriptions = this._subscriptions.filter((target) => target !== item)
        this._run()
    }

    _cancel(): void {
        const subscriptions = this._subscriptions
        for (let i = 0, l = subscriptions.length; i < l; i++) {
            subscriptions[i].unsubscribe()
        }
        this._subscriptions = []
        this._qeue = []
        this.size = 0
    }
}

class UpdaterObserver {
    _di: Di;
    _adapter: Adapter;
    _prevData: KeyValueSyncUpdate[] = [];
    _qeue: AsyncQeue;

    status: Atom<UpdaterStatus>;

    constructor(di: Di) {
        this._di = di
        this._adapter = di._adapter
        this._qeue = new AsyncQeue(this)
        this.status = this._adapter.atom({
            type: 'complete'
        })
    }

    complete(transactions: ?Transaction[]): void {
        if (transactions) {
            this.next(transactions)
        }
        this.status.set({
            type: 'complete'
        })
        this._prevData = []
    }

    error({error, retry}: AsyncErrorResult) {
        this.status.set({
            type: 'error',
            retry,
            error
        })
        const pd = this._prevData
        if (pd) {
            this._adapter.transact(() => this._updateSync(pd, false))
        }
        this._prevData = []
    }

    next(transactions: Transaction[]): void {
        const adapter = this._adapter
        const qeue = this._qeue
        const status = this.status
        const asyncUpdates: AsyncUpdateThunk[] = []
        const syncUpdates: KeyValueSyncUpdate[] = []
        for (let i = 0, l = transactions.length; i < l; i++) {
            const tr: Transaction = transactions[i]
            if (Array.isArray(tr)) {
                syncUpdates.push(tr)
            } else if (typeof tr === 'function') {
                asyncUpdates.push(tr)
            } else {
                if (typeof tr !== 'object') {
                    throw new Error(`Not an object ${debugName(tr)}`)
                }
                const [target, deps, meta] = this._di.getMeta(tr.constructor)
                if (!meta || !meta.key) {
                    throw new Error(`Not @source annotated class: ${debugName(tr.constructor)}`)
                }
                syncUpdates.push([tr.constructor, tr])
            }
        }
        if (asyncUpdates.length) {
            if (qeue.size === 0 && status.get().type !== 'pending') {
                status.set({
                    type: 'pending'
                })
            }
            qeue.add(asyncUpdates)
        }
        if (syncUpdates.length) {
            adapter.transact(() => this._updateSync(syncUpdates, qeue.size > 0))
        }
    }

    _updateSync(updates: KeyValueSyncUpdate[], needRollback: boolean): void {
        const di = this._di
        for (let i = 0, l = updates.length; i < l; i++) {
            const [key, value] = updates[i]
            if (needRollback) {
                this._prevData.push([key, value])
            }
            di.atom(key).set(value)
        }
    }
}
if (0) ((new UpdaterObserver(...(0: any))): Observer<Transaction[], AsyncErrorResult>)

export default class Updater {
    _uo: UpdaterObserver;
    status: Derivable<UpdaterStatus>;

    constructor(di: Di) {
        this._uo = new UpdaterObserver(di)
        this.status = this._uo.status
    }

    set(transactions: Transaction[]): void {
        this._uo.next(transactions)
    }
}
deps(Di)(Updater)
