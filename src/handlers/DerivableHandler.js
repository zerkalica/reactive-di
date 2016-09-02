//@flow

import {DepInfo, DerivableMeta, IHandler, Collector} from 'reactive-di/common'
import type {Atom, Adapter, CacheMap, Derivable} from 'reactive-di/interfaces/atom'

import {fastCall, fastCreateObject} from 'reactive-di/utils/fastCall'

export default class DerivableHandler {
    handle({
        deps,
        isFactory,
        target,
        ctx
    }: DepInfo<DerivableMeta>, collector?: Collector): Derivable<*> {
        const depsAtom: Derivable<mixed[]> = ctx.resolveDeps(deps, collector)
        const fn: (target: Function, args: mixed[]) => mixed = isFactory ? fastCall : fastCreateObject
        const deriveItem: (args: mixed[]) => mixed = (args: mixed[]) => ctx.preprocess(fn(target, args))
        deriveItem.displayName = `${ctx.displayName}#derive`

        return depsAtom.derive(deriveItem)
    }

    postHandle(): void {}
}

if (0) ((new DerivableHandler(...(0: any))): IHandler<DerivableMeta, Derivable<*>>)
