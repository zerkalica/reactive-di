// @flow
import type {Key} from './interfaces/deps'
import type {Adapter, Atom, Derivable} from './interfaces/atom'
import type {
    KeyValueSyncUpdate,
    SyncUpdate,
    AsyncUpdate,
    AsyncUpdateThunk,
    Transaction,
    UpdaterStatusType,
    IUpdater,
    IUpdaterStatus
} from './interfaces/updater'
import Di from './Di'
import promiseToObservable from './utils/promiseToObservable'
import debugName from './utils/debugName'
import {RdiMeta, deps} from './annotations'
import UpdaterStatus from './UpdaterStatus'

function noop() {}

class OperationObserver {
    _parentObserver: Observer<Transaction[], Error>;
    _unsubscribe: () => void;
    _cancel: () => void;

    constructor(
        parentObserver: Observer<Transaction[], Error>,
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
        this._parentObserver.error(err)
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
    _parentObserver: Observer<Transaction[], Error>;

    // Readonly qeue size
    size: number = 0;

    constructor(
        parentObserver: Observer<Transaction[], Error>,
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

    status: Atom<IUpdaterStatus>;

    constructor(di: Di, pending: boolean) {
        this._di = di
        this._adapter = di._adapter
        this._qeue = new AsyncQeue(this)
        this.status = this._adapter.atom(new UpdaterStatus(pending ? 'pending' : 'complete'))
    }

    complete(transactions: ?Transaction[]): void {
        if (transactions) {
            this.next(transactions)
        }
        this.status.set(new UpdaterStatus('complete'))
        this._prevData = []
    }

    error(error: Error) {
        this._adapter.transact(() => {
            this.status.set(new UpdaterStatus('error', error, noop))
            this._updateSync(this._prevData, false)
        })
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
                status.set(new UpdaterStatus('pending'))
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
if (0) ((new UpdaterObserver(...(0: any))): Observer<Transaction[], Error>)

export default class Updater {
    _uo: UpdaterObserver;

    static pending: boolean;

    status: Derivable<IUpdaterStatus>;
    set __di(di) {
        this._uo.__di = di
    }
    constructor(di: Di) {
        this._uo = new UpdaterObserver(di, this.constructor.pending || false)
        this.status = this._uo.status
    }

    set(transactions: Transaction[]): void {
        this._uo.next(transactions)
    }
}
deps(Di)(Updater)
if (0) ((new Updater(...(0: any))): IUpdater)
