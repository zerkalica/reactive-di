/* eslint-env mocha */
/* @flow */

import assert from 'power-assert'
import sinon from 'sinon'

import annotations from './annotations'
import createPureStateDi from '../createPureStateDi'
import {createState} from './TestState'

const {factory} = annotations

describe('DiEventsTest', () => {
    it('should not update non-mounted listener', () => {
        const {B, AppState, bSetter} = createState()
        const di = createPureStateDi(new AppState(), factory)
        const fn = sinon.spy(v => v)
        const bSet = di.get(bSetter)
        di.createUpdater({b: B}, fn, 'test updater')
        bSet(321)
        assert(fn.notCalled)
    })

    it('should update mounted listener', () => {
        const {B, AppState, bSetter} = createState()
        const di = createPureStateDi(new AppState(), factory)
        const fn = sinon.spy(v => v)
        const bSet = di.get(bSetter)
        const updater = di.createUpdater({b: B}, fn, 'test updater')
        updater.mount()

        bSet(321)
        bSet(333)

        assert(fn.calledTwice)
        assert(fn.firstCall.calledWith({b: {v: 321}}))
        assert(fn.secondCall.calledWith({b: {v: 333}}))
    })

    it('should not update listener, if changed another path', () => {
        const {C, AppState, bSetter} = createState()

        const fn = sinon.spy(v => v)

        const di = createPureStateDi(new AppState(), factory)
        const updater = di.createUpdater({c: C}, fn, 'test updater')
        updater.mount()

        const bSet = di.get(bSetter)
        bSet({v: 321})
        assert(fn.notCalled)
    })

    it('should not update unsubscribed listener', () => {
        const {B, AppState, bSetter} = createState()

        const di = createPureStateDi(new AppState(), factory)
        const bSet = di.get(bSetter)
        const fn = sinon.spy(v => v)
        const updater = di.createUpdater({b: B}, fn, 'test updater')
        updater.mount()
        bSet(321)
        updater.unmount()
        bSet(333)
        assert(fn.calledOnce)
        assert(fn.calledWith({b: {v: 321}}))
    })
})
