/* eslint-env mocha */
/* @flow */

import assert from 'power-assert'
import sinon from 'sinon'

import annotations from './annotations'
import createPureStateDi from '../createPureStateDi'
import {createState} from './TestState'

const {
    model,
    factory
} = annotations

describe('DiCacheTest', () => {
    it('should hit from cache, if no changes', () => {
        const {A, AppState} = createState()
        const di = createPureStateDi(new AppState())
        const fn = sinon.spy(v => v)
        const MyDep = factory(A)(fn)
        di.get(MyDep)
        di.get(MyDep)
        assert(fn.calledOnce)
    })

    it('should not hit a, if a.b changed', () => {
        const {A, AppState, aSetter} = createState()

        const di = createPureStateDi(new AppState())
        const fn = sinon.spy(v => v)
        factory(A)(fn)
        const aSet = di.get(aSetter)

        di.get(fn)
        aSet(321)
        di.get(fn)

        assert(fn.calledTwice)
        assert(fn.firstCall.calledWith({b: 123}))
        assert(fn.secondCall.calledWith({b: 321}))
    })

    it('should hit, if a.c changed', () => {
        const {B, AppState, cSetter} = createState()
        const di = createPureStateDi(new AppState())
        const fn = sinon.spy(v => v)
        const MyDep = factory(B)(fn)
        const cSet = di.get(cSetter)
        di.get(MyDep)
        cSet('test2')
        di.get(MyDep)
        assert(fn.calledOnce)
    })

    it('should not hit, if a changed', () => {
        const {A, C, B, AppState, aSetter} = createState()
        const di = createPureStateDi(new AppState())
        const fn = sinon.spy(v => v)
        const aSet = di.get(aSetter)
        factory(A)(fn)
        di.get(fn)
        aSet({
            c: new C(),
            b: new B()
        })
        di.get(fn)
        assert(fn.calledTwice)
    })
})
