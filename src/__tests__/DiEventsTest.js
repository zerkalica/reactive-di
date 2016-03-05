/* eslint-env mocha */
/* @flow */

import assert from 'power-assert'
import sinon from 'sinon'

import annotations from 'reactive-di/__tests__/annotations'
import {createState} from 'reactive-di/__tests__/TestState'
import Observable from 'zen-observable'

describe('DiEventsTest', () => {
    it('should not update non-mounted listener', () => {
        const {B, di, bSetter} = createState()
        const observableProps = annotations.observable({b: B})

        const fn = sinon.spy((v) => v)
        const bSet = di(bSetter)
        di(observableProps)
        bSet(321)
        assert(fn.notCalled)
    })

    it('should send data to all subscribers', () => {
        const {B, di, bSetter} = createState()
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
        const observableProps = annotations.observable({b: B});
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
        const {B, di, bSetter} = createState()
        const observer: Observer = {
            next: sinon.spy(),
            complete: sinon.spy(),
            error: sinon.spy()
        };
        const bSet = di(bSetter)
        const observableProps = annotations.observable({b: B})
        di(observableProps).observable.subscribe(observer)
        bSet(321)
        bSet(333)

        assert(observer.next.calledTwice)
        assert(observer.next.firstCall.calledWith({b: {v: 321}}))
        assert(observer.next.secondCall.calledWith({b: {v: 333}}))
    })

    it('should not update listener, if changed another path', () => {
        const {C, di, bSetter} = createState()

        const observer: Observer = {
            next: sinon.spy(),
            complete: sinon.spy(),
            error: sinon.spy()
        };
        const observableProps = annotations.observable({c: C})

        di(observableProps).observable.subscribe(observer)

        const bSet = di(bSetter)
        bSet(321)
        bSet(333)
        assert(observer.next.calledOnce)
    })

    it('should not update unsubscribed listener', () => {
        const {B, di, bSetter} = createState()
        const observer: Observer = {
            next: sinon.spy(),
            complete: sinon.spy(),
            error: sinon.spy()
        };
        const bSet = di(bSetter)
        const observableProps = annotations.observable({b: B})
        const subscription = di(observableProps).observable.subscribe(observer);
        bSet(321)
        subscription.unsubscribe()
        bSet(333)
        assert(observer.next.calledOnce)
        assert(observer.next.calledWith({b: {v: 321}}))
    })

    it('should update resubscribed listener', () => {
        const {B, di, bSetter} = createState()
        const observer: Observer = {
            next: sinon.spy(),
            complete: sinon.spy(),
            error: sinon.spy()
        };
        const bSet = di(bSetter)
        const observableProps = annotations.observable({b: B})
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
        const {C, B, di, bSetter} = createState()
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

        const observablePropsB = annotations.observable({b: B})
        const observablePropsC = annotations.observable({c: C})

        const observableB = di(observablePropsB).observable
        const observableC = di(observablePropsC).observable

        observableB.subscribe(observerB);
        observableC.subscribe(observerC);
        bSet(333)
        bSet(334)

        assert(observerB.next.calledTwice)
        assert(observerB.next.calledWith({b: {v: 333}}))
        assert(observerC.next.calledOnce)
    })
})
