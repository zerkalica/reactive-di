/* eslint-env mocha */
/* @flow */

import assert from 'power-assert'
import sinon from 'sinon'

import annotations from 'reactive-di/__tests__/annotations'
import createPureStateDi from 'reactive-di/createPureStateDi'
import {createState} from 'reactive-di/__tests__/TestState'
import Observable from 'zen-observable'

describe('DiEventsTest', () => {
    it('should not update non-mounted listener', () => {
        const {B, AppState, bSetter} = createState()
        function observableProps() {}
        annotations.observable({b: B})(observableProps)

        const di = createPureStateDi(new AppState())
        const fn = sinon.spy((v) => v)
        const bSet = di(bSetter)
        di(observableProps)
        bSet(321)
        assert(fn.notCalled)
    })

    it('should send data to all subscribers', () => {
        const {B, AppState, bSetter} = createState()
        const di = createPureStateDi(new AppState());
        class Observer1 {
            next = sinon.spy();
            complete = sinon.spy();
            error = sinon.spy();
        }

        class Observer2 extends Observer1 {
        }

        const observer1: Observer = new Observer1();
        const observer2: Observer = new Observer2();
        let observable: Observable;
        const bSet = di(bSetter)
        function observableProps() {}
        annotations.observable({b: B})(observableProps)
        observable = di(observableProps).observable

        observable.subscribe(observer1)
        observable.subscribe(observer2)

        bSet(321)

        assert(observer1.next.calledOnce)
        assert(observer1.next.firstCall.calledWith({b: {v: 321}}))

        assert(observer2.next.calledOnce)
        assert(observer2.next.firstCall.calledWith({b: {v: 321}}))
    })

    it('should update mounted listener', () => {
        const {B, AppState, bSetter} = createState()
        const di = createPureStateDi(new AppState())
        const observer: Observer = {
            next: sinon.spy(),
            complete: sinon.spy(),
            error: sinon.spy()
        }
        const bSet = di(bSetter)
        function observableProps() {}
        annotations.observable({b: B})(observableProps)
        di(observableProps).observable.subscribe(observer)
        bSet(321)
        bSet(333)

        assert(observer.next.calledTwice)
        assert(observer.next.firstCall.calledWith({b: {v: 321}}))
        assert(observer.next.secondCall.calledWith({b: {v: 333}}))
    })

    it('should not update listener, if changed another path', () => {
        const {C, AppState, bSetter} = createState()

        const di = createPureStateDi(new AppState())
        const observer: Observer = {
            next: sinon.spy(),
            complete: sinon.spy(),
            error: sinon.spy()
        }
        function observableProps() {}
        annotations.observable({c: C})(observableProps);

        di(observableProps).observable.subscribe(observer)

        const bSet = di(bSetter)
        bSet(321)
        assert(observer.next.notCalled)
    })

    it('should not update unsubscribed listener', () => {
        const {B, AppState, bSetter} = createState()
        const di = createPureStateDi(new AppState())
        const observer: Observer = {
            next: sinon.spy(),
            complete: sinon.spy(),
            error: sinon.spy()
        }
        const bSet = di(bSetter)
        function observableProps() {}
        annotations.observable({b: B})(observableProps);
        const subscription = di(observableProps).observable.subscribe(observer);
        bSet(321)
        subscription.unsubscribe()
        bSet(333)
        assert(observer.next.calledOnce)
        assert(observer.next.calledWith({b: {v: 321}}))
    })

    it('should update resubscribed listener', () => {
        const {B, AppState, bSetter} = createState()
        const di = createPureStateDi(new AppState())
        const observer: Observer = {
            next: sinon.spy(),
            complete: sinon.spy(),
            error: sinon.spy()
        }
        const bSet = di(bSetter)
        function observableProps() {}
        annotations.observable({b: B})(observableProps);
        const observable = di(observableProps).observable
        let subscription = observable.subscribe(observer);
        bSet(321)
        subscription.unsubscribe()
        bSet(333)
        subscription = observable.subscribe(observer);
        bSet(324)
        assert(observer.next.calledTwice)
        assert(observer.next.calledWith({b: {v: 324}}))
    })

    it('should handle one of two subscribed listener', () => {
        const {C, B, AppState, bSetter} = createState()
        const di = createPureStateDi(new AppState())
        const observerB: Observer = {
            next: sinon.spy(),
            complete: sinon.spy(),
            error: sinon.spy()
        };
        const observerC: Observer = {
            next: sinon.spy(),
            complete: sinon.spy(),
            error: sinon.spy()
        };
        const bSet = di(bSetter)

        function observablePropsB() {}
        annotations.observable({b: B})(observablePropsB);

        function observablePropsC() {}
        annotations.observable({c: C})(observablePropsC);

        const observableB = di(observablePropsB).observable
        const observableC = di(observablePropsC).observable

        observableB.subscribe(observerB);
        observableC.subscribe(observerC);
        bSet(333)

        assert(observerB.next.calledOnce)
        assert(observerB.next.calledWith({b: {v: 333}}))
        assert(observerC.next.notCalled)
    })
})
