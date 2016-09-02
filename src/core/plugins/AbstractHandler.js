//@flow

import {DepInfo, AbstractMeta, IHandler} from '../common'
import type {Atom} from '../../interfaces/atom'

export default class AbstractHandler {
    handle({
        target,
        ctx
    }: DepInfo<AbstractMeta>): Atom<*> {
        throw new Error(`Need register Abstract entity @componend({deps: []}) ${ctx.debugStr(target)}`)
    }

    postHandle(): void {}
}

if (0) ((new AbstractHandler(...(0: any))): IHandler<AbstractMeta, Atom<*>>)
