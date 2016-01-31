/* eslint-env mocha */
/* @flow */

import assert from 'power-assert'
import sinon from 'sinon'

import annotations from './annotations'
import createPureStateDi from '../createPureStateDi'
import {createState} from './TestState'


const {
    getter,
    setter,
    model,
    factory
} = annotations

import type {Getter} from '../plugins/getter/getterInterfaces'

describe('DiSettersGettersTest', () => {
    describe('getter', () => {
        it('should detached from state updates', () => {
            const {A, B, C, AppState} = createState()
            function bSetter(b: Getter<B>): (v: number) => B {
                return function bSet(v: number): B {
                    return b().copy({v})
                }
            }
            setter(B, getter(B))(bSetter)

            const fn = sinon.spy(v => v)
            factory(getter(B))(fn)

            const di = createPureStateDi(new AppState())
            const bSet = di.get(bSetter)
            di.get(fn)
            bSet(321)
            di.get(fn)
            assert(fn.calledOnce)
        })

        it('should get state in run-time', () => {
            const {A, B, C, AppState} = createState()
            function bSetter(b: B): (v: number) => B {
                return function bSet(v: number): B {
                    return b.copy({v})
                }
            }
            setter(B, B)(bSetter)

            const fn = sinon.spy(v => v)
            factory(getter(B))(fn)

            const di = createPureStateDi(new AppState())
            const bSet = di.get(bSetter)
            assert(di.get(fn)().v === 123)
            bSet(321)
            assert(di.get(fn)().v === 321)
        })
    })
})
