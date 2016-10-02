// @flow
import type {Key} from 'reactive-di/interfaces/deps'
import type {Adapter, Atom, Derivable} from 'reactive-di/interfaces/atom'
import type {IContext} from 'reactive-di/interfaces/internal'
import type {
    MultiAsyncUpdate,
    MultiUpdate,
    MultiAsyncUpdateResult,

    SingleAsyncUpdate,
    SingleUpdate,
    SingleAsyncUpdateResult
} from 'reactive-di/interfaces/updater'
import promiseToObservable from 'reactive-di/utils/promiseToObservable'
import debugName from 'reactive-di/utils/debugName'

function cloneInstance<Instance: Object>(target: Instance, props: $Shape<Instance>): Instance {
    return new target.constructor({...target, ...props})
}

type NormalizedSyncUpdate = [Key, Object]

class NormalizedMultiAsyncUpdate {
    type: 'multi' = 'multi'
    op: MultiAsyncUpdate
    constructor(op: MultiAsyncUpdate) {
        this.op = op
    }
}

class NormalizedSingleAsyncUpdate {
    type: 'single' = 'single'
    target: Key
    op: SingleAsyncUpdate

    constructor(target: Key, op: SingleAsyncUpdate) {
        this.op = op
        this.target = target
    }
}

type NormalizedAsyncUpdate = NormalizedMultiAsyncUpdate | NormalizedSingleAsyncUpdate

class SingleUpdateBucket {
    type: 'single' = 'single'
    syncs: NormalizedSyncUpdate[]
    asyncs: NormalizedAsyncUpdate[]

    constructor(rawUpdate: SingleUpdate, target: Key) {
        if (!target) {
            throw new Error('Target Class is not set for SingleUpdateBucket')
        }
        if (Array.isArray(rawUpdate)) {
            if (rawUpdate.length !== 2) {
                throw new Error('Wrong update rec: need a tuple [SingleSyncUpdate, SingleAsyncUpdate]')
            }
            this.syncs = [[target, (rawUpdate[0]: Object)]]
            this.asyncs = [new NormalizedSingleAsyncUpdate(target, rawUpdate[1])]
        } else if (typeof rawUpdate === 'function') {
            this.asyncs = [new NormalizedSingleAsyncUpdate(target, rawUpdate)]
            this.syncs = []
        } else {
            this.asyncs = []
            this.syncs = [[target, rawUpdate]]
        }
    }
}

class MultiUpdateBucket {
    type: 'multi' = 'multi'
    syncs: NormalizedSyncUpdate[]
    asyncs: NormalizedAsyncUpdate[]

    constructor(updates: MultiUpdate[]) {
        const asyncs: NormalizedAsyncUpdate[] = this.asyncs = []
        const syncs: NormalizedSyncUpdate[] = this.syncs = []
        for (let i = 0; i < updates.length; i++) {
            const update: MultiUpdate = updates[i]
            if (typeof update === 'function') {
                asyncs.push(new NormalizedMultiAsyncUpdate(update))
            } else if (Array.isArray(update)) {
                if (update.length !== 2) {
                    throw new Error(`Need a tuple: [Key, Object] in ${debugName(update)}`)
                }
                syncs.push(update)
            } else {
                if (update.constructor === Object) {
                    throw new Error(`Can't be a raw object: ${debugName(update)}`)
                }
                syncs.push([update.constructor, update])
            }
        }
    }
}

type UpdateBucket = SingleUpdateBucket | MultiUpdateBucket

type UpdaterStatusType = 'error' | 'pending' | 'complete'

export class UpdaterStatus {
    complete: boolean
    pending: boolean
    error: ?Error
    retry: ?(() => void)

    constructor(
        type?: UpdaterStatusType,
        error?: ?Error,
        retry?: ?() => void
    ) {
        this.complete = type === 'complete'
        this.pending = !type || type === 'pending'
        this.retry = retry || null
        this.error = error || null
    }
}

interface OperationErrorRec {
    error: Error;
    op: NormalizedAsyncUpdate;
}

type Update = MultiUpdate[] | SingleUpdate

class OperationObserver {
    _parentObserver: Observer<UpdateBucket, OperationErrorRec>
    _unsubscribe: () => void
    _cancel: () => void
    _op: NormalizedAsyncUpdate
    _target: ?Key

    constructor(
        parentObserver: Observer<UpdateBucket, OperationErrorRec>,
        unsubscribe: () => void,
        cancel: () => void,
        op: NormalizedAsyncUpdate
    ) {
        this._parentObserver = parentObserver
        this._unsubscribe = unsubscribe
        this._cancel = cancel
        this._op = op
    }

    next(ops: ?Update): void {
        if (ops) {
            this._parentObserver.next(
                this._op.type === 'single'
                    ? new SingleUpdateBucket((ops: any), this._op.target)
                    : new MultiUpdateBucket(((ops: any): MultiUpdate[]))
            )
        }
    }

    error(err: Error): void {
        // this._unsubscribe()
        this._cancel()
        this._parentObserver.error({
            error: err,
            op: this._op
        })
    }

    complete(ops?: Update): void {
        this._unsubscribe()
        if (!ops) {
            this._parentObserver.complete(null)
            return
        }

        this._parentObserver.complete(
            this._op.type === 'single'
                ? new SingleUpdateBucket((ops: any), this._op.target)
                : new MultiUpdateBucket(((ops: any): MultiUpdate[]))
        )
    }
}

class AsyncQeue {
    _maxQeueSize: number
    _qeue: NormalizedAsyncUpdate[] = []
    _subscriptions: Subscription[] = []
    _parentObserver: Observer<UpdateBucket, OperationErrorRec>

    // Readonly qeue size
    size: number = 0

    constructor(
        parentObserver: Observer<UpdateBucket, OperationErrorRec>,
        maxQeueSize: number = 1
    ) {
        this._maxQeueSize = maxQeueSize
        this._parentObserver = parentObserver
    }

    add(ops: NormalizedAsyncUpdate[]): void {
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
        const asyncUpdate: NormalizedAsyncUpdate = this._qeue.pop()
        let observable: Observable<Update, Error>
        const update: SingleAsyncUpdateResult | MultiAsyncUpdateResult = asyncUpdate.op()
        if (update.then) {
            observable = promiseToObservable(((update: any): Promise<Update>))
        } else if (update.subscribe) {
            observable = ((update: any): Observable<Update, Error>)
        } else {
            throw new Error(`Unknown operation: ${debugName(asyncUpdate.op)}`)
        }

        let subscription: Subscription

        const unsubscribe: () => void = () => this._removeSubscription(subscription)
        const cancel: () => void = () => this.cancel()

        const observer: Observer<Update, Error> = new OperationObserver(
            this._parentObserver,
            unsubscribe,
            cancel,
            asyncUpdate
        )

        subscription = observable.subscribe(observer)
        this._subscriptions.push(subscription)
    }

    _removeSubscription(item: Subscription): void {
        this.size = this.size - 1
        this._subscriptions = this._subscriptions.filter((target) => target !== item)
        if (this.size) {
            this._run()
        }
    }

    cancel(): void {
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
    displayName: string
    status: Atom<UpdaterStatus>

    _di: IContext
    _adapter: Adapter
    _qeue: AsyncQeue
    _rollbackOnError: boolean

    _errorUpdates: NormalizedAsyncUpdate[] = []
    _pendingUpdates: NormalizedSyncUpdate[] = []

    constructor(
        di: IContext,
        maxSize: number,
        rollbackOnError: boolean
    ) {
        this._di = di
        this._rollbackOnError = rollbackOnError
        this._adapter = di.adapter
        this._qeue = new AsyncQeue((this: Observer<UpdateBucket, OperationErrorRec>), maxSize)
        this.status = this._adapter.atom(new UpdaterStatus('complete'))
    }

    cancel(): void {
        this._errorUpdates = []
        this._qeue.cancel()
    }

    complete(updates: ?UpdateBucket): void {
        if (updates) {
            this.next(updates)
        } else if (this._qeue.size === 0) {
            this.status.set(new UpdaterStatus('complete'))
            this._pendingUpdates = []
        }
    }

    _retry: () => void = () => {
        if (this._errorUpdates.length) {
            this._qeue.add(this._errorUpdates)
            this._errorUpdates = []
        }
    };

    error({error, op}: OperationErrorRec) {
        this._errorUpdates.push(op)
        const onError = () => {
            this.status.set(new UpdaterStatus('error', error, this._retry))
            if (this._rollbackOnError) {
                this._updateSync(this._pendingUpdates, false)
            }
        }
        this._adapter.transact(onError)
        this._pendingUpdates = []
    }

    next({syncs, asyncs}: UpdateBucket): void {
        const adapter = this._adapter
        const qeue = this._qeue
        const status = this.status
        if (asyncs.length) {
            if (!status.get().pending) {
                status.set(new UpdaterStatus('pending'))
            }
            qeue.add(asyncs)
        }
        if (syncs.length) {
            adapter.transact(() => this._updateSync((syncs: NormalizedSyncUpdate[]), qeue.size > 0))
        }
        if (qeue.size === 0) {
            this._errorUpdates = []
        }
    }

    _updateSync(updates: NormalizedSyncUpdate[], needRollback: boolean): void {
        const di = this._di
        const pd = this._pendingUpdates
        for (let i = 0, l = updates.length; i < l; i++) {
            const rec = updates[i]
            if (!Array.isArray(rec)) {
                throw new Error('Wrong updates rec: must by an NormalizedSyncUpdate tuple')
            }
            const [key, props] = rec
            if (!key) {
                throw new Error('NormalizedSyncUpdate key can\'t be null')
            }
            if (!props) {
                throw new Error('NormalizedSyncUpdate props can\'t be null')
            }
            if (needRollback) {
                pd.push(rec)
            }
            di.val(key).swap(cloneInstance, props)
        }
        if (!needRollback) {
            this.status.set(new UpdaterStatus('complete'))
            this._pendingUpdates = []
        }
    }
}
if (0) ((new UpdaterObserver(...(0: any))): Observer<UpdateBucket, OperationErrorRec>) // eslint-disable-line

export default class Updater {
    displayName: string
    status: Derivable<UpdaterStatus>

    _uo: UpdaterObserver

    static maxSize: number = 10
    static rollbackOnError: boolean = false

    constructor(di: IContext) {
        const c = this.constructor
        this.displayName = `${di.displayName}#${debugName(c)}`
        this._uo = new UpdaterObserver(
            di,
            c.maxSize,
            c.rollbackOnError
        )
        this._uo.displayName = this.displayName + '#updater'
        this.status = this._uo.status
        const unsubscribeUpdater = (isStopped: boolean) => {
            if (isStopped) {
                this._uo.cancel()
            }
        }
        di.stopped.react(unsubscribeUpdater, {
            skipFirst: true,
            once: true
        })
    }

    cancel(): Updater {
        this._uo.cancel()
        return this
    }

    setSingle(rawUpdate: SingleUpdate, target: Key): Updater {
        this._uo.next(new SingleUpdateBucket(rawUpdate, target))
        return this
    }

    set(updates: MultiUpdate[]): Updater {
        this._uo.next(new MultiUpdateBucket(updates))
        return this
    }
}
