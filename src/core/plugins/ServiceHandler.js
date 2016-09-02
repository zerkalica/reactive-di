//@flow

import {DepInfo, ServiceMeta, IHandler, IContext} from '../common'
import type {Atom, Derivable} from '../../interfaces/atom'
import type {DepFn} from '../../interfaces/deps'

import debugName from '../../utils/debugName'
import {fastCall, fastCallMethod, fastCreateObject} from '../../utils/fastCall'

export default class ServiceHandler {
    handle({
        deps,
        isFactory,
        target,
        ctx
    }: DepInfo<ServiceMeta>): Atom<*> {
        const depsAtom: Derivable<mixed[]> = ctx.resolveDeps(deps)

        return ctx.adapter.atom(isFactory
            ? this._createDetachedFactory(target, depsAtom, ctx)
            : this._createDatachedObject(target, depsAtom, ctx)
        )
    }

    _createDatachedObject<V: Object>(target: Class<V>, depsAtom: Derivable<mixed[]>, ctx: IContext): V {
        const obj: V = fastCreateObject(target, depsAtom.get())
        function onServiceChange(deps: mixed[]): void {
            fastCallMethod(obj, target, deps)
        }
        depsAtom.react(onServiceChange, {
            skipFirst: true,
            until: ctx.stopped
        })

        return ctx.preprocess(obj)
    }

    _createDetachedFactory<V: Function>(target: DepFn<V>, depsAtom: Derivable<mixed[]>, ctx: IContext): V {
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
        factory.displayName = `${debugName(target)}#service`

        return ctx.preprocess((factory: any))
    }

    postHandle(): void {}
}

if (0) ((new ServiceHandler(...(0: any))): IHandler<ServiceMeta, Atom<*>>)
