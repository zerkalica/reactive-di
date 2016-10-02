// @flow

import {DepInfo, AbstractMeta, IHandler} from 'reactive-di/core/common'
import type {Atom} from 'reactive-di/interfaces/atom'

export default class AbstractHandler {
    handle({
        target,
        ctx
    }: DepInfo<any, AbstractMeta>): Atom<*> {
        throw new Error(`Need register Abstract entity ${ctx.debugStr(target)}`)
    }
}

if (0) ((new AbstractHandler(...(0: any))): IHandler) // eslint-disable-line
