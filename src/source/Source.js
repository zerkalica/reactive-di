// @flow

import DisposableCollection from '../utils/DisposableCollection'
import type {IDisposableCollection} from '../utils/DisposableCollection'
import {setterKey} from '../interfaces'
import type {IContext} from '../commonInterfaces'

import debugName from '../utils/debugName'

import type {
    ISlave,
    IMaster,
    IComputed,
    IRelationBinder,
    IAsyncValue,
    ISourceStatus,
    IBaseHook,
    IUpdatePayload,
    ISource,
    INotifier,
    ISourceInt
} from './interfaces'
import Computed from '../computed/Computed'
import SourceObservable from './SourceObservable'

const fakeHook: any = {
    cached: {},
    resolve() {},
    init() {},
    closed: false
}

function defaultMerge<V: any, M: any>(newVal: M, oldVal: V): V {
    return Array.isArray(newVal)
        ? newVal
        : Object.assign((Object.create(oldVal.constructor.prototype): any), oldVal, newVal || {})
}

export default class Source<V: Object, M> implements ISourceInt<V, M> {
    t: 0 = 0
    masters: IMaster[] = [this]
    id: number
    displayName: string
    cached: ?V = null
    closed: boolean = false
    refs: number = 0
    status: ?ISourceStatus = null
    context: IContext

    _notifier: INotifier

    _oldValue: V
    _initVal: V
    _hook: IComputed<IBaseHook<V, M>>
    _slaves: IDisposableCollection<ISlave> = new DisposableCollection()
    _observable: ?SourceObservable<V, M> = null
    _cbs: ?((v: V) => void)[] = null
    _errCbs: ?((e: Error) => void)[] = null
    _statusSlaves: ?IDisposableCollection<ISlave> = null

    constructor(key: any, context: IContext) {
        this.id = key._r0 || (++context.notifier.lastId, ++context.notifier.lastId) // eslint-disable-line
        key._r0 = this.id // eslint-disable-line
        this.displayName = key.displayName || debugName(key)
        this.context = context
        this._notifier = context.notifier
        this._oldValue = (null: any)
        this._hook = fakeHook
        if (key._rdiHook) {
            this._hook = new Computed(key._rdiHook, context, (this: ISource<any, M>))
            context.disposables.push(this)
        }

        const initialValue: any = context.values[this.displayName] || null
        if (initialValue) {
            if (!(key._r2 & 128)) {
                this._oldValue = key._r2 & 64
                    ? new key((initialValue: M)) // eslint-disable-line
                    : Object.assign(new key(), (initialValue: M)) // eslint-disable-line
            } else {
                this._oldValue = initialValue
            }
        } else {
            this._oldValue = new key() // eslint-disable-line
        }
        this._initVal = this._oldValue
        ;(this._oldValue: any)[setterKey] = this // eslint-disable-line
    }

    get(): V {
        let newValue: ?V = this._oldValue

        const hook = this._hook.cached || this._hook.get()

        if (hook.merge && newValue) {
            newValue = hook.merge((newValue: any), this._oldValue)
        }

        if (hook.pull && newValue) {
            const result: ?IAsyncValue<M> | void = hook.pull(newValue, this._oldValue, this)
            // hook.pull can set current source value via this.set
            if (this.cached) {
                newValue = this.cached
            }
            if (result) {
                if (this._observable) {
                    this._observable.abort()
                }
                if (!this.status) {
                    this.status = 'PENDING'
                }
                this._observable = new SourceObservable(result, this, 'pull', this._notifier)
            }
        } else {
            newValue = this._oldValue
        }

        this.cached = this._oldValue = newValue

        return this._oldValue
    }

    update(payload: IUpdatePayload<V, M>): () => void {
        if (this._observable) {
            this._observable.abort()
        }
        const obs = this._observable = new SourceObservable(payload.run(), this, 'update', this._notifier)
        if (payload.complete) {
            this.then(payload.complete)
        }
        if (payload.error) {
            this.catch(payload.error)
        }

        return () => obs.abort()
    }

    getStatus(): ISourceStatus {
        if (!this.cached) {
            this.get()
        }
        if (!this.status) {
            this.status = 'COMPLETE'
        }

        return this.status
    }

    _resolved: boolean = false

    resolveStack({stack, level, status, consumer}: IRelationBinder) {
        const slaves = this._slaves.items
        const id = this.id
        for (let i = level, l = stack.length; i < l; i++) {
            const rec = stack[i]
            if (!rec.has[id]) {
                const v = rec.v
                rec.has[id] = true
                slaves.push(v)
                if (v.t === 0) {
                    v.masters.push(this)
                }
            }
        }

        if (status) {
            status.masters.push(this)
            if (!this._statusSlaves) {
                this._statusSlaves = new DisposableCollection()
            }
            this._statusSlaves.items.push(status)
            if (consumer) {
                this._statusSlaves.items.push(consumer)
            }
        } else if (consumer) {
            slaves.push(consumer)
            if (this._hook !== fakeHook) {
                consumer.hooks.push(this)
            }
        }
    }

    resolve(binder: IRelationBinder) {
        const masters = this.masters

        for (let j = 0, k = masters.length; j < k; j++) {
            masters[j].resolveStack(binder)
        }

        if (!this._resolved) {
            this._resolved = true
            binder.begin(this, false)
            this._hook.resolve(binder)
            binder.end()
        }
    }

    _actualize(slaves: ISlave[]) {
        const {consumers: allConsumers} = this._notifier
        for (let i = 0, l = slaves.length; i < l; i++) {
            const v = slaves[i]
            v.cached = null
            if (!v.closed && v.t === 1) {
                allConsumers.push(v)
            }
        }
    }

    then(cb: (v: V) => void): this {
        if (this.status === 'COMPLETE' && this.cached !== this._initVal) {
            cb(this.cached || this.get())
            return this
        }
        if (!this._cbs) {
            this._cbs = []
        }
        this._cbs.push(cb)

        return this
    }

    catch(cb: (e: Error) => void): this {
        if (this.status instanceof Error) {
            cb(this.status)
            return this
        }
        if (!this._errCbs) {
            this._errCbs = []
        }
        this._errCbs.push(cb)

        return this
    }

    dispose() {
        this.reap()
        if (this._hook !== fakeHook) {
            this._hook.closed = true
        }
    }

    reap() {
        this._cbs = null
        this._errCbs = null
        if (this._observable) {
            this._observable.abort()
            this._observable = null
        }
        const hook = this._hook.cached || this._hook.get()
        if (hook.reap) {
            hook.reap(this.cached || this.get(), this._oldValue)
        }
        this.cached = null
    }

    error(err: Error) {
        const cbs = this._errCbs
        const oldStatus = this.status
        if (oldStatus === err) {
            return
        }
        this.status = err
        if (cbs) {
            for (let i = 0; i < cbs.length; i++) {
                cbs[i](err)
            }
            this._cbs = null
            this._errCbs = null
        }
        if (this._statusSlaves) {
            this._actualize(this._statusSlaves.items)
        }
        this._notifier.changed(this.displayName, this.status, oldStatus)
    }

    pend(isPending: boolean) {
        const oldStatus = this.status
        const newStatus = isPending ? 'PENDING' : 'COMPLETE'
        if (oldStatus === newStatus) {
            return
        }
        this.status = newStatus
        if (this._statusSlaves) {
            this._actualize(this._statusSlaves.items)
        }
        if (!isPending) {
            const cbs = this._cbs
            if (cbs) {
                const oldVal = this._oldValue
                for (let i = 0; i < cbs.length; i++) {
                    cbs[i](oldVal)
                }
            }
            this._cbs = null
            this._errCbs = null
        }

        this._notifier.changed(this.displayName + 'Status', this.status, oldStatus)
    }

    reset(rawNewVal?: ?M) {
        const oldId = this._notifier.begin(this._notifier.trace || this.displayName)
        this.pend(false)
        this.set(rawNewVal, true)
        this._notifier.end(oldId)
    }

    merge(rawNewVal?: ?M) {
        this.set(rawNewVal)
    }

    set(rawNewVal?: ?M, noPut?: boolean) {
        const hook = this._hook.cached || this._hook.get()
        const oldValue: V = this._oldValue
        let newVal: ?V
        if (!rawNewVal) {
            newVal = this._initVal
        } else if (hook.merge) {
            newVal = hook.merge(rawNewVal, oldValue)
        } else if (oldValue) {
            newVal = defaultMerge(rawNewVal, oldValue)
        } else {
            newVal = (rawNewVal: any)
        }

        if (!newVal || newVal === oldValue) {
            return
        }
        this.cached = this._oldValue = newVal
        ;(newVal: any)[setterKey] = this // eslint-disable-line

        this._actualize(this._slaves.items)

        if (!noPut && hook.put) {
            const result: IAsyncValue<M> | void = hook.put(newVal, oldValue, this)
            if (result) {
                if (this._observable) {
                    this._observable.abort()
                }
                if (!this.status) {
                    this.status = 'PENDING'
                }
                this._observable = new SourceObservable(result, this, 'put', this._notifier)
            }
        }

        const cbs = this._cbs
        if (cbs) {
            for (let i = 0; i < cbs.length; i++) {
                cbs[i](newVal)
            }
        }
        this._cbs = null
        this._errCbs = null

        this._notifier.changed(this.displayName, newVal, oldValue)
    }
}
