/* eslint-env mocha */
/* @flow */

import assert from 'power-assert'
import sinon from 'sinon'

import annotations from './annotations'
import createPureStateDi from '../createPureStateDi'
import {createState} from './TestState'

const {
    model,
    klass,
    factory,
    setter
} = annotations

describe('DiEventsTest', () => {
    it('should update mounted listener', () => {
        const {A, B, C, AppState, aSetter} = createState()
        const di = createPureStateDi(new AppState())
        const fn = sinon.spy(v => {
            return v
        })
        factory(A)(fn)
        const aSet = di.get(aSetter)
        const subscription = di.subscribe(fn)

        aSet(321)
        aSet(333)

        assert(fn.calledTwice)
        assert(fn.firstCall.calledWith({ b: { v: 123 }, c: { v: 'test' }, v: 321 }))
        assert(fn.secondCall.calledWith({ b: { v: 123 }, c: { v: 'test' }, v: 333 }))
    })

    it('should not update listener, if changed another path', () => {
        const {A, B, C, AppState, bSetter} = createState()

        const fn = sinon.spy(v => v)
        factory(C)(fn)

        const di = createPureStateDi(new AppState())
        const bSet = di.get(bSetter)
        di.subscribe(fn)
        bSet({v: 321})
        assert(fn.notCalled)
    })

    it('should not update unsubscribed listener', () => {
        const {A, B, C, AppState, bSetter} = createState()

        const di = createPureStateDi(new AppState())
        const bSet = di.get(bSetter)
        const fn = sinon.spy(v => {
            return v
        })
        factory(B)(fn)

        const subscription = di.subscribe(fn)
        bSet({v: 321})
        subscription.unsubscribe()
        bSet({v: 333})
        assert(fn.calledOnce)
        assert(fn.calledWith({v: 321}))
    })
})
