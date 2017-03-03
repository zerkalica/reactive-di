// @flow

import type {IRawArg} from '../interfaces'
import type {IContext} from '../commonInterfaces'

import debugName from '../utils/debugName'
import {fastCreateObject, fastCall} from '../utils/fastCreate'
import resolveArgs from '../utils/resolveArgs'
import type {IGetable, IArg} from '../utils/resolveArgs'
import type {ISource} from '../source/interfaces'
import Hook from '../hook/Hook'
import type {INotifier, IHook} from '../hook/interfaces'

import wrapObject, {wrapFunction} from './wrapObject'
import type {IRef} from './wrapObject'

export default class Computed<V: Object> {
    t: 0
    displayName: string
    id: number

    closed: boolean
    cached: ?V
    sources: ISource<*>[]
    hooks: IHook<*>[]

    cachedSrc: V
    notifier: INotifier

    context: IContext
    _resolved: boolean
    _hook: ?IHook<V>
    _create: (proto: Function, args: mixed[]) => V
    _proto: IGetable<Function>
    _args: ?IArg[]
    _argVals: mixed[]

    _rawArgs: ?IRawArg[]
    _protoKey: Function
    _isWrapped: boolean

    constructor(
        key: Function,
        context: IContext
    ) {
        // ;(this: IComputed<V>) // eslint-disable-line
        this.t = 0

        this.id = key._rdiId || ++context.binder.lastId // eslint-disable-line
        key._rdiId = this.id // eslint-disable-line
        this._rawArgs = key._rdiArg || null
        this.displayName = key._rdiKey || debugName(key)
        this._proto = ({cached: key}: Object)
        this._protoKey = key
        this._create = key._rdiFn ? fastCall : fastCreateObject
        this._isWrapped = key._rdiEnd || false
        this._hook = key._rdiHook
            ? new Hook(key._rdiHook, context, this)
            : null
        this.sources = []
        this.hooks = this._hook ? [this._hook] : []
        this.notifier = context.notifier
        this.cachedSrc = (null: any)
        this.closed = false
        this.cached = null
        this._cachedProxy = (null: any)
        this._resolved = false
        this._args = null
        this._argVals = (null: any)
        this.context = context
    }

    resolve(): void {
        const hook: ?IHook<V> = this._hook
        const context = this.context
        if (!this._resolved) {
            this._resolved = true
            context.binder.begin(this, this._isWrapped)
            if (context.protoFactory) {
                this._proto = context.protoFactory.resolveSource(this._protoKey)
            }
            if (hook) {
                hook.resolve()
            }
            this._args = this._rawArgs ? context.resolveDeps(this._rawArgs) : null
            if (this._args) {
                this._argVals = new Array(this._args.length)
            }
            context.binder.end()
            return
        }

        const hooks = this.hooks
        for (let i = 0, l = hooks.length; i < l; i++) {
            hooks[i].resolve()
        }

        if (!this._isWrapped || context.binder.status) {
            const sources = this.sources
            for (let i = 0, l = sources.length; i < l; i++) {
                sources[i].resolve()
            }
        }
    }

    _cachedProxy: V

    get(): V {
        this.cached = this._cachedProxy
        if (this._args && !resolveArgs(this._args, this._argVals)) {
            return this.cached
        }
        const newVal = this._create(this._proto.cached || this._proto.get(), this._argVals || [])
        // copy old computed state, not setted in constructor (via setters) to new object
        const src = this.cachedSrc

        if (src) {
            for (const k in src) { // eslint-disable-line
                if (!newVal[k]) {
                    newVal[k] = src[k]
                }
            }
            if (this._hook && !this._hook.shouldUpdate(newVal, src)) {
                return this._cachedProxy
            }
        }

        this.cachedSrc = newVal

        if (this._isWrapped) {
            if (!this._cachedProxy) {
                this._cachedProxy = this.cached = this._isFunc
                    ? wrapFunction((this: IRef<any>))
                    : wrapObject((this: IRef<any>))
            }
        } else {
            this._cachedProxy = this.cached = newVal
        }

        return this._cachedProxy
    }
}
