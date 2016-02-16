/* eslint-env mocha */
/* @flow */

import assert from 'power-assert'
import sinon from 'sinon'

import annotations from 'reactive-di/__tests__/annotations'
import createPureStateDi from 'reactive-di/createPureStateDi'
import {createState} from 'reactive-di/__tests__/TestState'


const {
    getter,
    setter,
    model,
    factory
} = annotations

import type {Getter} from 'reactive-di/plugins/getter/getterInterfaces'

describe('DiSettersGettersTest', () => {
    describe('getter', () => {
        it('should detached from state updates', () => {
            const {B, C, AppState, bSetter} = createState()

            const fn = sinon.spy(v => v)
            factory(getter(B))(fn)

            const di = createPureStateDi(new AppState())
            const bSet = di(bSetter)
            di(fn)
            bSet(321)
            di(fn)
            assert(fn.calledOnce)
        })

        it('should get state in run-time', () => {
            const {A, B, C, AppState, bSetter} = createState()

            const fn = sinon.spy(v => v)
            factory(getter(B))(fn)

            const di = createPureStateDi(new AppState())
            const bSet = di(bSetter)
            assert(di(fn)().v === 123)
            bSet(321)
            assert(di(fn)().v === 321)
        })
    })
})
