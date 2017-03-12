// @flow

import type {IContext} from '../commonInterfaces'

import type {IShape, IRawArg} from '../interfaces'

import {fastCreateObject, fastCallMethod} from '../utils/fastCreate'
import debugName from '../utils/debugName'
import resolveArgs from '../utils/resolveArgs'
import type {ICacheable, IGetable, IArg} from '../utils/resolveArgs'

import type {INotifier, IHasForceUpdate, IBaseHook, IHook} from './interfaces'
import defaultMerge from './defaultMerge'

export default class Hook<P: Object> {
    t: 4
    id: number
    displayName: string

    closed: boolean
    cached: ?IBaseHook<P>
    hooks: IHook<*>[]
    context: IContext

    _prev: ?IBaseHook<P>
    _target: ?P
    _proto: IGetable<Function>
    _args: ?IArg[]
    _argVals: mixed[]

    _resolved: boolean
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

    _unsubscribe: ?() => void

    detach(): void {
        this._refs--
        const target = this._target.cached
        if (this._refs === 0 && target) {
            const hook = this.cached || this._get()
            if (this._unsubscribe) {
                this._unsubscribe()
            }
            if (hook.detach && !this._inWillMount) {
                const notifier = this._notifier
                const oldTrace = notifier.trace
                notifier.trace = this.displayName + '.detach'
                notifier.opId++
                this._inHook = true
                const oldHook = notifier.hook
                notifier.hook = this
                try {
                    (hook: any).detach(target)
                } catch (e) {
                    notifier.onError(e, this.displayName, false)
                }
                notifier.hook = oldHook
                this._inHook = false
                notifier.trace = oldTrace
            }
        }
    }

    merge(target: IShape<P>, oldValue: P): ?P {
        const hook = this.cached || this._get()
        const newVal: ?P = hook.merge
            ? hook.merge(target, oldValue)
            : defaultMerge(target, oldValue)

        if (!newVal) {
            return null
        }
        if (hook.put && !this._inHook) {
            const notifier = this._notifier
            const oldTrace = notifier.trace
            notifier.trace = this.displayName + '.put'
            notifier.opId++
            this._inHook = true
            const oldHook = notifier.hook
            notifier.hook = this
            try {
                const result = (hook: any).put(newVal)
                if (result) {
                    this._unsubscribe = target.update({
                        run() {
                            return result
                        }
                    })
                }
            } catch (e) {
                notifier.onError(e, this.displayName, false)
            }
            notifier.hook = oldHook
            this._inHook = false
            notifier.trace = oldTrace
        }
        return newVal
    }

    dispose(): void {
        this._refs = 0
        const target = this._target.cached
        if (!target || this.closed) {
            return
        }
        this.closed = true
        const hook = this.cached || this._get()
        if (hook.detach) {
            const notifier = this._notifier
            const oldTrace = notifier.trace
            notifier.trace = this.displayName + '.detach'
            notifier.opId++
            const oldHook = notifier.hook
            notifier.hook = this
            this._inHook = true
            try {
                (hook: any).detach(target)
            } catch (e) {
                notifier.onError(e, this.displayName, false)
            }
            notifier.hook = oldHook
            this._inHook = false
            notifier.trace = oldTrace
        }
    }

    willMount(): void {
        this._refs++
        if (this._refs === 1) {
            this.pull()
        }
    }

    pull(): ?IHasForceUpdate {
        const target = this._target.cached
        if (!target || this._inHook) {
            return
        }
        const hook = this.cached || this._get()
        const notifier = this._notifier
        const oldTrace = notifier.trace
        this._inHook = true
        notifier.opId++
        const oldHook = notifier.hook
        notifier.hook = this
        if (hook.pull) {
            notifier.trace = this.displayName + '.pull'
            try {
                const result = (hook: any).pull(target)
                if (result) {
                    this._unsubscribe = target.update({
                        run() {
                            return result
                        }
                    })
                }
            } catch (e) {
                notifier.onError(e, this.displayName, false)
            }
        }
        notifier.hook = oldHook
        notifier.trace = oldTrace
        this._inHook = false
    }

    _get(): IBaseHook<P> {
        if (!this.cached) {
            if (this._args) {
                resolveArgs(this._args, this._argVals)
            }
            const proto = this._proto.cached || this._proto.get()
            const prev = this._prev
            if (prev) {
                fastCallMethod(prev, prev.init || proto, this._argVals || [])
                this.cached = prev
            } else {
                this._prev = this.cached = fastCreateObject(
                    proto,
                    this._argVals || []
                )
            }
        }

        return this.cached
    }
}
