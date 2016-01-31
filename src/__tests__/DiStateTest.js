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

describe('DiStateTest', () => {
    it('should handle a.b, if a changed', () => {
        const {A, B, C, AppState} = createState()
        function aSetter(a: Getter<A>): (b: B) => B {
            return function aSet(b: B): B {
                return a().copy({b})
            }
        }
        setter(A, getter(A))(aSetter)
        const di = createPureStateDi(new AppState())
        const aSet = di.get(aSetter)
        const MyDep = factory(B)(v => v)
        di.get(MyDep)
        const b = new B()
        b.v = 321
        aSet(b)
        assert.deepEqual(di.get(MyDep), {v: 321})
    })

    it('should handle a, if a.b changed', () => {
        const {A, B, C, AppState} = createState()
        function bSetter(b: B): (v: number) => B {
            return function bSet(v: number): B {
                return b.copy({v})
            }
        }
        setter(B, B)(bSetter)

        const di = createPureStateDi(new AppState())
        const bSet = di.get(bSetter)
        const MyDep = factory(A)(v => v)
        di.get(MyDep)
        bSet(321)
        assert.deepEqual(di.get(MyDep), {
            b:{
                v:321
            },
            c:{
                v:'test'
            },
            v:123
        })
    })

    it('should not handle a.c, if a.b changed', () => {
        const {A, B, C, AppState} = createState()
        function bSetter(b: B): (v: number) => B {
            return function bSet(v: number): B {
                return b.copy({v})
            }
        }
        setter(B, B)(bSetter)

        const di = createPureStateDi(new AppState())
        const bSet = di.get(bSetter)

        const MyDep = factory(C)(v => v)
        di.get(MyDep)
        bSet(321)
        assert.deepEqual(di.get(MyDep), {v: 'test'})
    })

    it('should handle a.b, if a.b changed', () => {
        const {A, B, C, AppState} = createState()
        function bSetter(b: B): (v: number) => B {
            return function bSet(v: number): B {
                return b.copy({v})
            }
        }
        setter(B, B)(bSetter)

        const di = createPureStateDi(new AppState())
        const bSet = di.get(bSetter)

        const MyDep = factory(B)(v => v)
        di.get(MyDep)
        bSet(321)
        assert.deepEqual(di.get(MyDep), {v: 321})
    })
})
