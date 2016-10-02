// @flow

import {DepInfo, SourceMeta, IHandler} from 'reactive-di/core/common'
import type {Atom} from 'reactive-di/interfaces/atom'

export default class SourceHandler {
    handle<V, C: Class<V>>(di: DepInfo<C, SourceMeta>): Atom<V> {
        let atom: Atom<V>
        const {
            meta,
            target,
            ctx
        } = di
        const value: any = ctx.defaults[meta.key]
        /* eslint-disable new-cap */
        if (meta.construct) {
            atom = ctx.adapter.atom(ctx.preprocess((new target(value): any), di))
        } else {
            atom = ctx.adapter.isAtom(value)
                ? value
                : ctx.adapter.atom(ctx.preprocess(value || (new target(): any), di))
        }

        return atom
    }
}

if (0) ((new SourceHandler(...(0: any))): IHandler) // eslint-disable-line
