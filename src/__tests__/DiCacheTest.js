/* eslint-env mocha */
/* @flow */

import assert from 'power-assert'
import sinon from 'sinon'

import annotations from 'reactive-di/__tests__/annotations'
import {createState} from 'reactive-di/__tests__/TestState'

const {
    factory
} = annotations

describe('DiCacheTest', () => {
    it('should hit from cache, if no changes', () => {
        const {A, di} = createState()
        const fn = sinon.spy((v) => v)
        const MyDep = factory(A)(fn)
        di(MyDep)
        di(MyDep)
        assert(fn.calledOnce)
    })

    it('should not hit a, if a.b changed', () => {
        const {B, di, bSetter} = createState()

        const fn = sinon.spy((v) => v)
        factory(B)(fn)
        const bSet = di(bSetter)

        di(fn)
        bSet(321)
        di(fn)

        assert(fn.calledTwice)
        assert(fn.firstCall.calledWith({v: 123}))
        assert(fn.secondCall.calledWith({v: 321}))
    })

    it('should hit, if a.c changed', () => {
        const {B, di, cSetter} = createState()
        const fn = sinon.spy((v) => v)
        const MyDep = factory(B)(fn)
        const cSet = di(cSetter)
        di(MyDep)
        cSet('test2')
        di(MyDep)
        assert(fn.calledOnce)
    })

    it('should not hit, if a changed', () => {
        const {A, C, B, di, aSetter} = createState()
        const fn = sinon.spy((v) => v)
        const aSet = di(aSetter)
        factory(A)(fn)
        di(fn)
        aSet({
            c: new C(),
            b: new B()
        })
        di(fn)
        assert(fn.calledTwice)
    })
})
