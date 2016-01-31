/* eslint-env mocha */
/* @flow */

import assert from 'power-assert'
import sinon from 'sinon'

import annotations from './annotations'
import createPureStateDi from '../createPureStateDi'

const {
    model,
    klass,
    factory,
    setter
} = annotations

function createState() {
    class C {
        v: string = 'test';
        copy(rec: {v?: string}): C {
            const next = new C()
            next.v = rec.v || this.v
            return next
        }
    }
    model(C)

    class B {
        v: number = 123;
        copy(rec: {v?: number}): B {
            const next = new B()
            next.v = rec.v || this.v
            return next
        }
    }
    model(B)

    class A {
        b: B = new B();
        c: C = new C();
        v: number = 123;
        copy(rec: {b?: B, c?: C, v?: number}): A {
            const next = new A()
            next.b = rec.b || this.b
            next.c = rec.c || this.c
            next.v = rec.v || this.v
            return next
        }
    }
    model(A)

    class AppState {
        a: A = new A();
        copy(rec: {a?: A}): AppState {
            const next = new AppState()
            next.a = rec.a || this.a
            return next
        }
    }
    model(AppState)

    return {A, B, C, AppState}
}


describe('DiEventsTest', () => {
    it('should update mounted listener', () => {
        const {A, B, C, AppState} = createState()
        function aSetter(a: A): (v: number) => A {
            return function aSet(v: number): A {
                return a.copy({v})
            }
        }
        setter(A, A)(aSetter)

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
        const {A, B, C, AppState} = createState()
        function abSetter(b: B): (rec: {v: number}) => B {
            return function abSet(rec: {v: number}): B {
                return b.copy(rec)
            }
        }
        setter(B, B)(abSetter)

        const fn = sinon.spy(v => v)
        factory(C)(fn)

        const di = createPureStateDi(new AppState())
        const abSet = di.get(abSetter)
        di.subscribe(fn)
        abSet({v: 321})
        assert(fn.notCalled)
    })

    it('should not update unsubscribed listener', () => {
        const {A, B, C, AppState} = createState()
        function abSetter(b: B): (rec: {v: number}) => B {
            return function abSet(rec: {v: number}): B {
                return b.copy(rec)
            }
        }
        setter(B, B)(abSetter)

        const di = createPureStateDi(new AppState())
        const abSet = di.get(abSetter)
        const fn = sinon.spy(v => {
            return v
        })
        factory(B)(fn)

        const subscription = di.subscribe(fn)
        abSet({v: 321})
        subscription.unsubscribe()
        abSet({v: 333})
        assert(fn.calledOnce)
        assert(fn.calledWith({v: 321}))
    })
})
