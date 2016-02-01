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
        const {A, B, C, AppState, bSetter} = createState()
        const di = createPureStateDi(new AppState())
        const fn = sinon.spy(v => {
            return v
        })
        factory(A)(fn)
        const bSet = di.get(bSetter)
        const subscription = di.subscribe(fn)

        bSet(321)
        bSet(333)

        assert(fn.calledTwice)
        assert(fn.firstCall.calledWith({ b: { v: 321 }, c: { v: 'test' }, v: 123 }))
        assert(fn.secondCall.calledWith({ b: { v: 333 }, c: { v: 'test' }, v: 123 }))
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
        bSet(321)
        subscription.unsubscribe()
        bSet(333)
        assert(fn.calledOnce)
        assert(fn.calledWith({v: 321}))
    })
})
