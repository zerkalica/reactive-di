// @flow
import type {
    ISource,
    IGetable,
    IContext,
    ICacheable,
    IPullable,
    ISourceMeta,
    IDisposable,
    IBaseHook,
    IDisposableCollection,
    ISourceStatus
} from './interfaces'
import DisposableCollection from './DisposableCollection'
import {setterKey} from './interfaces'
import SourceStatus from './SourceStatus'

export default class Source<V> {
    t: 1
    displayName: string
    id: number
    refs: number
    computeds: IDisposableCollection<ICacheable<*> & IDisposable>
    consumers: IDisposableCollection<IPullable<*>>
    context: IContext
    status: ?ISource<ISourceStatus>
    cached: ?V

    _initialized: boolean
    _hook: IGetable<IBaseHook<V>>
    _configValue: ?V
    _isFetching: boolean
    _isPending: boolean
    _meta: ISourceMeta<V>
    _parent: ?ISource<*>
    isResolving: boolean

    constructor(
        meta: ISourceMeta<V>,
        context: IContext,
        parent?: ?ISource<*>
    ) {
        ;(this: ISource<V>) // eslint-disable-line
        this.t = 1
        this.refs = 0
        this._initialized = false
        this.status = null
        this._parent = parent
        this.computeds = new DisposableCollection()
        this.consumers = new DisposableCollection()
        this.displayName = meta.name
        this.id = meta.id
        this.context = context
        this._configValue = meta.configValue
        ;(meta.initialValue: any)[setterKey] = this // eslint-disable-line
        this.cached = meta.initialValue
        this._meta = meta
        this.isResolving = !!meta.hook
        this._hook = !meta.hook ? context.resolveHook(null) : (null: any)
        this._isFetching = meta.isFetching
        this._isPending = meta.isPending
    }

    willMount(_parent: ?IContext): void {
        if (this._parent) {
            this._parent.refs++
            this._parent.willMount(_parent)
        }
        const hook = this._hook.cached || this._hook.get()
        if (hook.init && !this._initialized) {
            this._initialized = true
            hook.init((this.cached: any))
        }
        if (hook.willMount) {
            hook.willMount((this.cached: any))
        }
    }

    willUnmount(parent: ?IContext): void {
        const hook = this._hook.cached || this._hook.get()
        if (hook.willUnmount) {
            hook.willUnmount((this.cached: any))
        }
        if (hook.dispose && parent === this.context) {
            hook.dispose((this.cached: any))
            this._initialized = false
        }
        const p = this._parent
        if (p) {
            p.willUnmount(parent)
            p.refs--
        }
    }

    resolve(): void {
        if (this.isResolving) {
            this.isResolving = false
            if (!this._hook) {
                this._hook = this.context.resolveHook(this._meta.hook)
            }
            return
        }

        const {stack, level} = this.context.binder
        let source: ISource<any> = this
        let computeds = source.computeds
        let consumers = source.consumers
        const isFetching = this._isFetching
        let i = stack.length
        while (--i >= 0) {
            const rec = stack[i]
            if (!rec.has[source.id]) {
                rec.has[source.id] = true
                if (rec.v.t === 3) { // status
                    if (isFetching) {
                        source = this.status || this.getStatus()
                        computeds = source.computeds
                        consumers = source.consumers
                        computeds.push(rec.v)
                        rec.v.masters.push(source)
                    }
                } else if (i >= level || source !== this) {
                    // consumer or computed
                    if (rec.v.t === 2) { // consumer
                        consumers.push(rec.v)
                    }
                    computeds.push(rec.v)
                    rec.v.masters.push(source)
                }
            }
        }
    }

    get(): V {
        throw new Error('Source always cached')
    }

    getStatus(): ISource<ISourceStatus> {
        if (!this.status) {
            const status: ISource<ISourceStatus> = new Source(
                ({
                    key: SourceStatus,
                    name: this.displayName + 'Status',
                    id: this.id - 1,
                    hook: null,
                    isFetching: false,
                    isPending: false,
                    configValue: null,
                    initialValue: new SourceStatus(this._isPending ? {pending: true} : null)
                }: ISourceMeta<ISourceStatus>),
                this.context,
                this
            )
            this.status = status.status = status
        }

        return this.status
    }

    merge(props: mixed): void {
        this.set(
            (this.cached: any).copy(props)
        //    Object.assign(
        //        Object.create((this.cached: any).constructor.prototype),
        //        (this.cached: any),
        //        props
        //    )
       )
    }

    set(v: V): void {
        if (v === this.cached) {
            return
        }
        const hook = this._hook.cached || this._hook.get()
        ;(v: any)[setterKey] = this // eslint-disable-line
        if (hook.shouldUpdate && !hook.shouldUpdate(v, this.cached)) {
            return
        }
        if (hook.willUpdate) {
            hook.willUpdate(v, this.cached)
        }
        const context = this.context
        const computeds = this.computeds.items
        for (let i = 0, l = computeds.length; i < l; i++) {
            computeds[i].cached = null
        }
        context.notifier.notify(this.consumers.items, this, v)
        this.cached = v
    }
}
