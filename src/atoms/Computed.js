// @flow

import type {
    IComputedMeta,
    IComputed,
    IArg,
    IGetable,
    INotifier,
    IContext,
    IBaseHook,
    IMaster,
    IMiddlewares
} from './interfaces'

import {fastCreateObject, fastCall} from '../utils/fastCreate'
import wrapObject, {wrapFunction} from '../utils/wrapObject'
import type {IRef} from '../utils/wrapObject'

import resolveArgs from './resolveArgs'

export default class Computed<V> {
    t: 0
    displayName: string

    id: number
    refs: number
    closed: boolean

    cached: ?V

    masters: IMaster[]
    context: IContext

    _notifier: ?INotifier
    _middlewares: ?IMiddlewares
    _resolved: boolean
    _initialized: boolean
    _hook: IGetable<IBaseHook<V>>
    _create: (proto: Function, args: mixed[]) => V
    _proto: IGetable<Function>
    _args: ?IArg[]
    _argVals: mixed[]
    _proxy: V

    _meta: IComputedMeta

    constructor(
        meta: IComputedMeta,
        context: IContext,
        isHook?: boolean
    ) {
        this.t = 0
        this.closed = false
        this.cached = null
        this.refs = 0
        this._proxy = (null: any)
        this._resolved = false
        this._initialized = false
        this._args = null
        this._argVals = (null: any)
        this._meta = meta
        this.displayName = meta.name
        this.id = meta.id
        this._create = meta.func ? fastCall : fastCreateObject
        this.masters = meta.hook ? [(this: IComputed<V>)] : []
        this.context = context
        this._middlewares = context.middlewares
        this._proto = ({cached: meta.key}: Object)
        this._notifier = isHook ? null : context.notifier
    }

    willMount(_parent: ?IContext): void {
        const hook = this._hook.cached || this._hook.get()
        if (hook.init && !this._initialized) {
            this._initialized = true
            hook.init(this._proxy)
        }
        if (hook.willMount) {
            hook.willMount(this._proxy)
        }
    }

    willUnmount(parent: ?IContext): void {
        const hook = this._hook.cached || this._hook.get()
        if (hook.willUnmount) {
            hook.willUnmount(this._proxy)
        }
        if (hook.dispose && parent === this.context) {
            hook.dispose(this._proxy)
            this.closed = true
            this._initialized = false
        }
    }

    onFunctionCall(args: any[], result: any): void {
        if (this._middlewares) {
            this._middlewares.onFuncCall(this.displayName, args, result)
        }
        if (this._notifier) {
            this._notifier.commit()
        }
    }

    onMethodCall(name: string | Symbol, args: any[], result: any): void {
        if (this._middlewares) {
            this._middlewares.onMethodCall(
                this.displayName,
                typeof name === 'string' ? name : name.toString(),
                args,
                result
            )
        }
        if (this._notifier) {
            this._notifier.commit()
        }
    }

    resolve(): void {
        if (!this._resolved) {
            this._resolved = true
            const {context, _meta: meta} = this
            context.binder.begin((this: IComputed<V>), meta.ender)
            if (context.protoFactory) {
                this._proto = context.protoFactory.resolveSource(meta.key)
            }
            this._hook = context.resolveHook(meta.hook)
            this._args = meta.args ? context.resolveDeps(meta.args) : null
            if (this._args) {
                this._argVals = new Array(this._args.length)
            }
            context.binder.end()
            return
        }

        const masters = this.masters
        const {stack, level} = this.context.binder
        const k = stack.length
        if (this._meta.ender) {
            return
        }
        for (let i = 0, l = masters.length; i < l; i++) {
            const master = masters[i]
            if (master.t === 1) { // source
                master.resolve()
            } else { // computed, consumer
                for (let j = level; j < k; j++) {
                    const rec = stack[j]
                    if (!rec.has[master.id]) {
                        rec.has[master.id] = true
                        rec.v.masters.push(master)
                    }
                }
            }
        }
    }

    get(): V {
        this.cached = this._proxy
        if (this._args && !resolveArgs(this._args, this._argVals)) {
            return this._proxy
        }

        const newVal = this._create(this._proto.cached || this._proto.get(), this._argVals || [])
        const hook = this._hook.cached || this._hook.get()

        if (!this._proxy || !hook.shouldUpdate || hook.shouldUpdate(newVal, this._proxy)) {
            if (hook.willUpdate) {
                hook.willUpdate(newVal, this.cached)
            }
            this.cached = newVal
            if (this._meta.ender) {
                if (!this._proxy) {
                    this._proxy = this._meta.func
                        ? wrapFunction((this: IRef<any>))
                        : wrapObject((this: IRef<any>))
                }
            } else {
                this._proxy = newVal
            }
        }

        return this._proxy
    }
}
