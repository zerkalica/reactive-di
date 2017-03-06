// @flow
import type {IContext} from '../commonInterfaces'

import {setterKey} from '../interfaces'
import Hook from '../hook/Hook'
import type {INotifierItem, IHook} from '../hook/interfaces'

import DisposableCollection from '../utils/DisposableCollection'
import type {IDisposableCollection, IDisposable} from '../utils/DisposableCollection'
import type {ICacheable} from '../utils/resolveArgs'
import debugName from '../utils/debugName'

import createSetterFn, {copy, fromEvent} from './createSetterFn'
import SourceStatus from './SourceStatus'
import type {IPromisable, IUpdater, ISourceStatus, ISetter, ISource, IControllable} from './interfaces'
import Promisable from './Promisable'

export default class Source<V: Object> {
    t: 1
    displayName: string
    id: number
    computeds: IDisposableCollection<ICacheable<any> & IDisposable>
    consumers: IDisposableCollection<INotifierItem>
    cached: ?V

    closed: boolean
    status: ?ISource<ISourceStatus>

    _hook: ?IHook<V>
    _isResolving: boolean
    context: IContext

    constructor(
        key: ?Function,
        context: IContext,
        id?: number,
        name?: string,
        initialValue?: V
    ) {
        (this: ISource<V>) // eslint-disable-line
        if (key) {
            this.displayName = key._rdiKey || debugName(key)
            const configValue: ?V = context.binder.values[this.displayName] || null
            if (configValue) {
                this.cached = key._rdiInst
                    ? configValue
                    : !!key._rdiConstr
                        ? new (key: any)(configValue) // eslint-disable-line
                        : Object.assign(new key(), configValue) // eslint-disable-line
            } else {
                this.cached = (new key(): any) // eslint-disable-line
            }
            this.id = key._rdiId || (++context.binder.lastId, ++context.binder.lastId) // eslint-disable-line
            this._hook = key._rdiHook ? new Hook(key._rdiHook, context, this) : null
            this._isResolving = !!this._hook
            key._rdiId = this.id // eslint-disable-line
        } else {
            this._hook = null
            this._isResolving = false
            this.id = id || 0
            this.displayName = name || ''
            this.cached = initialValue
        }

        this.t = 1
        this.closed = false
        this.status = null
        this.computeds = new DisposableCollection()
        this.consumers = new DisposableCollection()
        this.context = context
        ;(this.cached: any)[setterKey] = this // eslint-disable-line
        this._setter = null
        this._eventSetter = null
        this._promisable = null
    }

    resolve(): void {
        if (this._isResolving && this._hook) {
            this._isResolving = false
            this._hook.resolve()
        }

        const binder = this.context.binder
        const stack = binder.stack
        let source: ISource<any> = (this: ISource<V>)
        let consumers = source.consumers
        let computeds = source.computeds
        const status = binder.status
        if (status) {
            /**
             * status(3) - status -> source.computeds (for cache invalidating)
             *     source -> status.sources (for caching, pass to another computed in future)
             */
            source = this.getStatus()
            consumers = source.consumers
            computeds = source.computeds
            source.computeds.push(status)
            status.sources.push((source: ISource<ISourceStatus>))
        }

        for (let i = binder.level, l = stack.length; i < l; i++) {
            const rec = stack[i]
            if (!rec.has[source.id]) {
                const v = rec.v
                if (v.t === 3) {
                    throw new Error('not here')
                }
                rec.has[source.id] = true
                /**
                 * v is
                 *
                 * computed(1) - computed -> source.computeds (for cache invalidating),
                 *     source -> computed.sources (for caching, pass to another computed in future)
                 *
                 * consumer(2) - consumer -> source.consumers (for triggering state changes),
                 *     consumer -> source.computeds (for cache invalidating),
                 *     source.hook -> consumer.hooks (for livecycle callbacks)
                 *
                 * hook(4) - hook -> source.consumers (for triggering state changes),
                 *     hook -> source.computeds (for cache invalidating)
                 */
                computeds.push((v: ICacheable<*> & IDisposable))
                if (v.t === 0) { // computed
                    v.sources.push((source: ISource<*>))
                } else if (v.t === 2) { // consumer
                    consumers.push((v: INotifierItem))
                } else { // hook
                    consumers.push((v: INotifierItem))
                }
            }
        }
    }

    _createSetter(
        getValue: ?(rawVal: any) => mixed
    ): ISetter<V> {
        const notifier = this.context.notifier
        const obj = this.cached
        if (!obj) {
            throw new Error('Not cached')
        }
        const result = Object.create(obj.constructor)
        const propNames: string[] = Object.getOwnPropertyNames(obj)
        for (let i = 0, l = propNames.length; i < l; i++) {
            const pn = propNames[i]
            result[pn] = createSetterFn((this: ISource<V>), notifier, pn, getValue)
        }
        result.displayName = this.displayName + 'Setter'
        result.__rdiSetter = true

        return result
    }

    _setter: ?ISetter<V>
    setter(): ISetter<V> {
        if (!this._setter) {
            this._setter = this._createSetter()
        }
        return this._setter
    }

    _eventSetter: ?ISetter<V>
    eventSetter(): ISetter<V> {
        if (!this._eventSetter) {
            this._eventSetter = this._createSetter(fromEvent)
        }
        return this._eventSetter
    }

    get(): V {
        throw new Error('Source always cached')
    }

    getStatus(): ISource<ISourceStatus> {
        if (!this.status) {
            const status: ISource<ISourceStatus> = new Source(
                null,
                this.context,
                this.id - 1,
                this.displayName + 'Status',
                (new SourceStatus(): ISourceStatus)
            )
            this.status = status
        }

        return this.status
    }

    _promisable: ?IPromisable<V>
    _getPromisable(): IPromisable<V> {
        if (!this._promisable) {
            this._promisable = new Promisable()
        }

        return this._promisable
    }

    promise(): Promise<V> {
        return this._getPromisable().promise
    }

    merge(v?: {[id: $Keys<V>]: mixed}): void {
        if (!this.cached) {
            throw new Error('cached not defined')
        }

        this.set(copy(this.cached, v || {}))
    }

    update(updaterPayload: IUpdater<any>): () => void {
        const updater: IControllable = new this.context.Updater(
            updaterPayload,
            (this: ISource<V>),
            this.getStatus(),
            this._getPromisable(),
            this.context.notifier
        )
        updater.run()

        return () => updater.abort()
    }

    reset(): void {
        if (!this.cached) {
            throw new Error('cached not defined')
        }
        const val = new this.cached.constructor()
        this.set(val)
    }

    set(v: V): void {
        if (v === this.cached) {
            return
        }
        ;(v: any)[setterKey] = this // eslint-disable-line
        if (this._hook && this.cached && !this._hook.shouldUpdate(v, this.cached)) {
            return
        }
        if (this.status) {
            this.status.reset()
        }
        const computeds = this.computeds.items
        for (let i = 0, l = computeds.length; i < l; i++) {
            computeds[i].cached = null
        }
        this.context.notifier.notify(this.consumers.items, this.displayName, this.cached, v)
        this.cached = v
    }
}
