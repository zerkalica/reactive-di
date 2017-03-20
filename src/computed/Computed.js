// @flow

import type {IRawArg} from '../interfaces'

import type {IContext} from '../commonInterfaces'

import type {
    IRelationBinder,
    IBaseHook,
    IGetable,
    IComputed,
    IMaster,
    INotifier
} from '../source/interfaces'

import debugName from '../utils/debugName'
import {fastCallMethod, fastCreateObject, fastCall} from './fastCreate'
import wrapObject, {wrapFunction} from './wrapObject'
import type {IResolverTarget} from './wrapObject'
import resolveArgs from './resolveArgs'
import type {IArg} from './resolveArgs'

const fakeHook: any = {
    cached: {}
}

export default class Computed<V: Object> implements IComputed<V> {
    t: 0 = 0 // computed

    displayName: string
    id: number
    masters: IMaster[] = []
    closed: boolean = false
    cached: ?V = null

    refs: number = 0

    notifier: INotifier
    context: IContext
    rawValue: V = (null: any)

    _oldValue: V = (null: any)
    _hook: IComputed<IBaseHook<V, V>>
    _create: (proto: Function, args: mixed[]) => V

    _wrap: ?((v: IResolverTarget<V>) => V)

    _proto: IGetable<Function>
    _args: ?IArg[] = null
    _argVals: mixed[] = (null: any)

    _protoKey: Function
    _rawArgs: ?IRawArg[]

    constructor(key: Function, context: IContext) {
        this.id = key._r0 || ++context.notifier.lastId // eslint-disable-line
        key._r0 = this.id // eslint-disable-line
        this.displayName = key.displayName || debugName(key)
        this._rawArgs = key._r1
        this._proto = ({cached: key}: Object)
        this._protoKey = key
        this._create = key._r2 & 2 ? fastCall : fastCreateObject
        this._hook = fakeHook
        if (key._rdiHook) {
            this._hook = new Computed(key._rdiHook, context)
            context.disposables.push(this)
        }
        this.context = context
        this._wrap = key._r2 & 16
            ? key._r2 & 2 ? wrapFunction : wrapObject
            : null
        this.notifier = context.notifier
    }

    resolve(binder: IRelationBinder) {
        const hook = this._hook
        const consumer = binder.consumer
        if (!this._argVals) {
            const context = this.context

            binder.begin(this, !!this._wrap)
            if (context.protoFactory) {
                this._proto = context.protoFactory.resolveSource(this._protoKey)
            }
            if (hook !== fakeHook) {
                hook.resolve(binder)
                if (consumer) {
                    consumer.hooks.push(hook)
                }
            }
            this._args = this._rawArgs ? context.resolveDeps(this._rawArgs) : null
            this._argVals = this._args ? new Array(this._args.length) : []
            binder.end()

            return
        }

        if (consumer && hook !== fakeHook) {
            consumer.hooks.push(hook)
        }
        if (this._wrap) {
            binder.consumer = null
        }
        const masters = this.masters || []
        for (let i = 0, l = masters.length; i < l; i++) {
            masters[i].resolve(binder)
        }
        binder.consumer = consumer
    }

    dispose() {
        this.reap()
        if (this._hook !== fakeHook) {
            this._hook.closed = true
        }
        this.closed = true
    }

    reap() {
        const hook = this._hook.cached || this._hook.get()
        if (hook.reap) {
            hook.reap(this.cached || this.get(), this._oldValue)
        }
        this.cached = null
    }

    get(): V {
        if (this._args && !resolveArgs(this._args, this._argVals)) {
            return this._oldValue
        }
        const proto = this._proto.cached || this._proto.get()
        const wrap = this._wrap
        let newValue: ?V
        const hook = this._hook.cached || this._hook.get()
        const oldId = this.context.notifier.begin(this.displayName)
        if (this.rawValue) {
            newValue = this.rawValue
            fastCallMethod(newValue, proto, this._argVals)
            if (hook.merge) {
                newValue = hook.merge(newValue, null)
                if (newValue) {
                    this.rawValue = newValue
                }
            }
        } else if (wrap) {
            newValue = this._create(proto, this._argVals)
            this.rawValue = hook.merge
                ? hook.merge(newValue, this.rawValue) || newValue
                : newValue
            this._oldValue = wrap(this)
        } else if (hook.merge) {
            newValue = (hook: any).merge(this._create(proto, this._argVals), this._oldValue)
            if (newValue) {
                this._oldValue = newValue
            }
        } else {
            newValue = this._create(proto, this._argVals)
            const oldValue = this._oldValue
            // Copy old state to new object
            for (const i in oldValue) { // eslint-disable-line
                if (newValue[i] === undefined) {
                    newValue[i] = oldValue[i]
                }
            }
            this._oldValue = newValue
        }
        this.context.notifier.end(oldId)
        this.cached = this._oldValue

        return this.cached
    }
}
