// @flow

import type {
    IComputedMeta,
    IComputed,
    IArg,
    IGetable,
    IContext,
    IBaseHook,
    IMaster,
    IMiddlewares
} from './interfaces'
import {fastCreateObject, fastCallMethod, fastCall} from './fastCreate'
import resolveArgs from './resolveArgs'

type IRef<V> = {
    cached: V;
    _middlewares: ?IMiddlewares;
}

const refProxyHandler = {
    get(r: IRef<any>, name: string): mixed {
        let val = r.cached[name]
        if (typeof val === 'function' && !val.__binded) {
            const orig = r.cached[name]
            val = r.cached[name] = function setter(...args: any[]) { // eslint-disable-line
                const result = fastCallMethod(r.cached, orig, args)
                if (r._middlewares) {
                    r._middlewares.onMethodCall(r.cached, name, args, result)
                }
                return result
            }
            val.displayName = name
            val.__binded = true
        }

        return val
    },

    set(r: IRef<any>, name: string, value: mixed): boolean {
        r.cached[name] = value // eslint-disable-line
        return false
    }
}

function createFunctionProxy<V>(ref: IRef<V>): () => V {
    if (typeof ref.cached !== 'function') {
        throw new Error(`Not a function ${String(ref.cached)}`)
    }

    return function fnProxy(...args: mixed[]): V {
        const result = fastCall((ref.cached: any), args) // eslint-disable-line
        if (ref._middlewares) {
            ref._middlewares.onFuncCall((ref.cached: any), args, result)
        }
        return result
    }
}

export default class Computed<V> {
    t: 0
    displayName: string

    id: number
    refs: number
    closed: boolean

    cached: ?V

    masters: IMaster[]
    context: IContext

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
        context: IContext
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
    }

    willMount(_parent: ?IContext): void {
        const hook = this._hook.cached || this._hook.get()
        if (hook.init && !this._initialized) {
            this._initialized = true
            hook.init()
        }
        if (hook.willMount) {
            hook.willMount()
        }
    }

    willUnmount(parent: ?IContext): void {
        const hook = this._hook.cached || this._hook.get()
        if (hook.willUnmount) {
            hook.willUnmount()
        }
        if (hook.dispose && parent === this.context) {
            hook.dispose()
            this.closed = true
            this._initialized = false
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
        for (let i = 0, l = masters.length; i < l; i++) {
            const master = masters[i]
            if (master.t === 1) {
                master.resolve()
            } else {
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

        if (!this._proxy || !hook.shouldUpdate || hook.shouldUpdate(this._proxy, newVal)) {
            if (hook.willUpdate) {
                hook.willUpdate(newVal, this.cached)
            }
            this.cached = newVal
            if (this._meta.ender) {
                if (!this._proxy) {
                    this._proxy = this._meta.func
                        ? (createFunctionProxy(this): any)
                        : (new Proxy(this, refProxyHandler): any)
                }
            } else {
                this._proxy = newVal
            }
        }

        return this._proxy
    }
}
