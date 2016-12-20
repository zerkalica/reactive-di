// @flow
import type {
    ISource,
    ISetter,
    INotifier,
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
    setter: ?ISetter<V>
    eventSetter: ?ISetter<V>

    _initialized: boolean
    _hook: IGetable<IBaseHook<V>>
    _configValue: ?V
    _isFetching: boolean
    _isPending: boolean
    _meta: ISourceMeta<V>
    _parent: ?ISource<*>

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
        this._hook = this.context.resolveHook(meta.hook)
        this._meta = meta
        this._isFetching = meta.isFetching
        this._isPending = meta.isPending
        this.setter = null
    }

    getSetter(isEventSetter?: boolean): ISetter<V> {
        const setter = this.setter = {}
        const eventSetter = this.eventSetter = {}
        const notifier = this.context.notifier
        const keys = Object.keys((this.cached: any))

        for (let i = 0; i < keys.length; i++) {
            this._createSetter(keys[i], notifier)
        }

        return isEventSetter ? eventSetter : setter
    }

    getEventSetter(): ISetter<V> {
        return this.getSetter(true)
    }

    _createSetter(key: string, notifier: INotifier): void {
        const setter = (v: mixed) => { // eslint-disable-line
            const cached: Object = (this.cached: any)
            const obj: any = Object.assign(Object.create(cached.constructor.prototype), cached)
            obj[key] = v
            this.set(obj)
            notifier.commit()
        }
        setter.displayName = `${this.displayName}.set.${key}`

        ;(this.setter: any)[key] = setter
        function eventSetter(e: Object) {
            return setter(e.target.value)
        }
        eventSetter.displayName = `${this.displayName}.setEvent.${key}`
        ;(this.eventSetter: any)[key] = eventSetter
    }

    willMount(_parent: ?IContext): void {
        if (this._parent) {
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
        if (this._parent) {
            this._parent.willUnmount(parent)
        }
    }

    resolve(): void {
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
        if (context.middlewares) {
            context.middlewares.onSetValue(this, v)
        }
        this.cached = v

        const computeds = this.computeds.items
        for (let i = 0, l = computeds.length; i < l; i++) {
            computeds[i].cached = null
        }
        context.notifier.notify(this.consumers.items)
    }
}
