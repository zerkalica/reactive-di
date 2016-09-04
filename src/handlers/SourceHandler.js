//@flow

import {DepInfo, SourceMeta, IHandler} from 'reactive-di/common'
import type {Atom} from 'reactive-di/interfaces/atom'

export default class SourceHandler {
    handle<V, C: Class<V>>({
        meta,
        target,
        ctx
    }: DepInfo<C, SourceMeta>): Atom<V> {
        let atom: Atom<V>
        const value: any = ctx.defaults[meta.key]
        if (meta.construct) {
            atom = ctx.adapter.atom(ctx.preprocess((new target(value): any)))
        } else {
            atom = ctx.adapter.isAtom(value)
                ? value
                : ctx.adapter.atom(ctx.preprocess(value || (new target(): any)))
        }

        return atom
    }

    postHandle(): void {}
}

if (0) ((new SourceHandler(...(0: any))): IHandler)
