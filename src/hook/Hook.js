// @flow

import type {IContext} from '../commonInterfaces'

import type {IRawArg} from '../interfaces'

import {fastCreateObject} from '../utils/fastCreate'
import debugName from '../utils/debugName'
import resolveArgs from '../utils/resolveArgs'
import type {ICacheable, IGetable, IArg} from '../utils/resolveArgs'

import type {INotifier, IHasForceUpdate, IBaseHook, IHook} from './interfaces'

export default class Hook<P: Object> {
    t: 4
    id: number
    displayName: string

    closed: boolean
    cached: ?IBaseHook<P>
    _prev: ?IBaseHook<P>

    hooks: IHook<*>[]

    _target: ?P
    _proto: IGetable<Function>
    _args: ?IArg[]
    _argVals: mixed[]

    _resolved: boolean
    context: IContext
    _refs: number

    _rawArgs: ?IRawArg[]
    _protoKey: Function
    _target: ICacheable<P>
    _notifier: INotifier
    _inHook: boolean

    constructor(
        key: Function,
        context: IContext,
        target: ICacheable<P>
    ) {
        (this: IHook<P>) // eslint-disable-line
        this.t = 4

        this.id = key._rdiId || ++context.binder.lastId // eslint-disable-line
        key._rdiId = this.id // eslint-disable-line
        this._rawArgs = key._rdiArg || null
        this.displayName = key._rdiKey || debugName(key)
        this._proto = ({cached: key}: Object)
        this._protoKey = key
        this._target = target
        this.hooks = []
        this.closed = false
        this.cached = null
        this._resolved = false
        this._args = null
        this._argVals = (null: any)
        this._refs = 0
        this.context = context
        this._prev = null
        this._inHook = false
        this._notifier = context.notifier
    }

    resolve(): void {
        const stack = this.context.binder.stack
        const k = stack.length
        if (!this._resolved) {
            this._resolved = true
            const context = this.context
            context.disposables.push(this)
            context.binder.begin(this, true)
            if (context.protoFactory) {
                this._proto = context.protoFactory.resolveSource(this._protoKey)
            }

            for (let j = 0; j < k; j++) {
                const parent = stack[j]
                const v = parent.v
                parent.has[this.id] = true
                if (v.t !== 3) { // hook, computed, consumer
                    v.hooks.push(this)
                }
            }

            this._args = this._rawArgs
                ? context.resolveDeps(this._rawArgs)
                : null

            if (this._args) {
                this._argVals = new Array(this._args.length)
            }
            context.binder.end()
            return
        }

        const hooks = this.hooks
        for (let i = 0, l = hooks.length; i < l; i++) {
            const hook = hooks[i]
            for (let j = 0; j < k; j++) {
                const parent = stack[j]
                if (!parent.has[hook.id]) {
                    const v = parent.v
                    parent.has[hook.id] = true
                    if (v.t !== 3) { // hook, computed, consumer
                        v.hooks.push(hook)
                    }
                }
            }
        }
    }

    willMount(): void {
        if (this._refs === 0) {
            this._refs++
            const hook = this.cached || this._get()
            const target = this._target.cached
            if (hook.willMount && target) {
                const notifier = this._notifier
                const oldTrace = notifier.trace
                notifier.trace = this.displayName + '.willMount'
                notifier.opId++
                this._inHook = true
                try {
                    (hook: any).willMount(target)
                } catch (e) {
                    this._inHook = false
                    throw e
                }
                this._inHook = false
                notifier.trace = oldTrace
            }
        } else {
            this._refs++
        }
    }

    willUnmount(): void {
        this._refs--
        const target = this._target.cached
        if (this._refs === 0 && target) {
            const hook = this.cached || this._get()
            if (hook.willUnmount && !this._inWillMount) {
                const notifier = this._notifier
                const oldTrace = notifier.trace
                notifier.trace = this.displayName + '.willUnmount'
                notifier.opId++
                this._inHook = true
                try {
                    (hook: any).willUnmount(target)
                } catch (e) {
                    this._inHook = false
                    throw e
                }
                this._inHook = false
                notifier.trace = oldTrace
            }
        }
    }

    shouldUpdate(target: P, oldValue: P): boolean {
        const hook = this.cached || this._get()
        if (
            hook.shouldUpdate
            && !hook.shouldUpdate(target, oldValue)
        ) {
            return false
        }
        if (hook.willUpdate && !this._inHook) {
            const notifier = this._notifier
            const oldTrace = notifier.trace
            notifier.trace = this.displayName + '.willUpdate'
            notifier.opId++
            this._inHook = true
            try {
                (hook: any).willUpdate(target)
            } catch (e) {
                this._inHook = false
                throw e
            }
            this._inHook = false
            notifier.trace = oldTrace
        }
        return true
    }

    dispose(): void {
        this._refs = 0
        const target = this._target.cached
        if (!target || this.closed) {
            return
        }
        this.closed = true
        const hook = this.cached || this._get()
        if (hook.willUnmount) {
            const notifier = this._notifier
            const oldTrace = notifier.trace
            notifier.trace = this.displayName + '.willUnmount'
            notifier.opId++
            this._inHook = true
            try {
                (hook: any).willUnmount(target)
            } catch (e) {
                this._inHook = false
                throw e
            }
            this._inHook = false
            notifier.trace = oldTrace
        }
    }

    pull(): ?IHasForceUpdate {
        const target = this._target.cached
        if (!target) {
            return
        }
        const hook = this.cached || this._get()
        const notifier = this._notifier
        const oldTrace = notifier.trace
        this._inHook = true
        if (hook.selfUpdate) {
            notifier.trace = this.displayName + '.selfUpdate'
            try {
                (hook: any).selfUpdate(target)
            } catch (e) {
                this._inHook = false
                throw e
            }
        }
        notifier.trace = oldTrace
        this._inHook = false
    }

    _get(): IBaseHook<P> {
        if (!this.cached) {
            if (this._args) {
                resolveArgs(this._args, this._argVals)
            }
            const cached = this.cached = fastCreateObject(
                this._proto.cached || this._proto.get(),
                this._argVals || []
            )
            const prev = this._prev
            if (prev) {
                // copy properties, injected after initializing
                for (const k in prev) { // eslint-disable-line
                    if (!cached[k]) {
                        cached[k] = (prev: Object)[k]
                    }
                }
            }
            this._prev = this.cached
        }

        return this.cached
    }
}
