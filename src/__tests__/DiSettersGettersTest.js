/* eslint-env mocha */
/* @flow */

import assert from 'power-assert'
import sinon from 'sinon'

import annotations from './annotations'
import createPureStateDi from '../createPureStateDi'

const {
    model,
    getter,
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


describe('DiSettersGettersTest', () => {
    it('should get state in run-time', () => {
        const {A, B, C, AppState} = createState()
        function bSetter(b: B): (v: number) => B {
            return function bSet(v: number): B {
                return b.copy({v})
            }
        }
        setter(B, B)(bSetter)

        const fn = sinon.spy(v => v)
        factory(getter(B))(fn)

        const di = createPureStateDi(new AppState())
        const bSet = di.get(bSetter)
        assert(di.get(fn)().v === 123)
        bSet(321)
        assert(di.get(fn)().v === 321)
    })
})
