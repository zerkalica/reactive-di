/* eslint-env mocha */
/* @flow */

import assert from 'power-assert'

import annotations from 'reactive-di/__tests__/annotations'
import {createState} from 'reactive-di/__tests__/TestState'

const {
    factory
} = annotations

describe('DiStateTest', () => {
    it('should handle a.b, if a changed', () => {
        const {B, di, aSetter} = createState()
        const aSet = di(aSetter)
        const MyDep = factory(B)((v) => v)
        di(MyDep)
        const b = new B()
        b.v = 321
        aSet(b)
        assert.deepEqual(di(MyDep), {v: 321})
    })

    it('should handle a, if a.b changed', () => {
        const {A, di, bSetter} = createState()
        const bSet = di(bSetter)
        const MyDep = factory(A)((v) => v)
        di(MyDep)
        bSet(321)
        assert.deepEqual(di(MyDep), {
            b: {
                v: 321
            },
            c: {
                v: 'test'
            },
            v: 123
        })
    })

    it('should not handle a.c, if a.b changed', () => {
        const {C, di, bSetter} = createState()
        const bSet = di(bSetter)

        const MyDep = factory(C)((v) => v)
        di(MyDep)
        bSet(321)
        assert.deepEqual(di(MyDep), {v: 'test'})
    })

    it('should handle a.b, if a.b changed', () => {
        const {B, di, bSetter} = createState()
        const bSet = di(bSetter)

        const MyDep = factory(B)((v) => v)
        di(MyDep)
        bSet(321)
        assert.deepEqual(di(MyDep), {v: 321})
    })
})
