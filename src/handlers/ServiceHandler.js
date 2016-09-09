//@flow

import {DepInfo, ServiceMeta, IHandler} from 'reactive-di/core/common'
import type {Atom, Derivable} from 'reactive-di/interfaces/atom'
import type {IContext} from 'reactive-di/interfaces/internal'
import type {DepFn} from 'reactive-di/interfaces/deps'

import debugName from 'reactive-di/utils/debugName'
import {fastCall, fastCallMethod, fastCreateObject} from 'reactive-di/utils/fastCall'

export default class ServiceHandler {
    handle<V>(di: DepInfo<V, ServiceMeta>): Atom<V> {
        const {
            deps,
            isFactory,
            ctx
        } = di
        const depsAtom: Derivable<mixed[]> = ctx.resolveDeps(deps)

        return ctx.adapter.atom(isFactory
            ? this._createDetachedFactory(depsAtom, di)
            : this._createDatachedObject(depsAtom, di)
        )
    }

    _createDatachedObject<V: Object>(depsAtom: Derivable<mixed[]>, di: DepInfo<any, ServiceMeta>): V {
        const {target, ctx} = di
        const obj: V = fastCreateObject(target, depsAtom.get())
        function onServiceChange(deps: mixed[]): void {
            fastCallMethod(obj, target, deps)
        }
        depsAtom.react(onServiceChange, {
            skipFirst: true,
            until: ctx.stopped
        })

        return ctx.preprocess(obj, di)
    }

    _createDetachedFactory<V: Function>(depsAtom: Derivable<mixed[]>, di: DepInfo<any, ServiceMeta>): V {
        const {target, ctx} = di
        let fn: DepFn<V> = fastCall(target, depsAtom.get())
        if (typeof fn !== 'function') {
            throw new Error(`Must be a function: ${ctx.debugStr(target)}`)
        }
        function onFactoryChange(deps: mixed[]): void {
            fn = fastCall(target, deps)
        }

        depsAtom.react(onFactoryChange, {
            until: ctx.stopped,
            skipFirst: true
        })

        function factory(...args: mixed[]): any {
            return fastCall(fn, args)
        }
        factory.displayName = debugName(target)

        return ctx.preprocess((factory: any), di)
    }
}

if (0) ((new ServiceHandler(...(0: any))): IHandler)
