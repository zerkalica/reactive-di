// @flow

import {DepInfo, DerivableMeta, IHandler} from 'reactive-di/core/common'
import type {Atom, Derivable} from 'reactive-di/interfaces/atom'

import {fastCall, fastCreateObject} from 'reactive-di/utils/fastCall'

export default class DerivableHandler {
    handle<V>(di: DepInfo<V, DerivableMeta>): Atom<V> {
        const {
            deps,
            isFactory,
            target,
            ctx
        } = di
        const depsAtom: Derivable<mixed[]> = ctx.resolveDeps(deps)
        const fn: (target: Function, args: mixed[]) => V = isFactory ? fastCall : fastCreateObject

        const deriveItem: (args: mixed[]) => V = (args: mixed[]) =>
            ctx.preprocess(fn(target, args), di)

        deriveItem.displayName = `${ctx.displayName}#derive`

        return ((depsAtom.derive(deriveItem): any): Atom<V>)
    }

    postHandle(): void {}
}

if (0) ((new DerivableHandler(...(0: any))): IHandler) // eslint-disable-line
