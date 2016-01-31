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

describe('DiStateTest', () => {
    it('should hit from cache, if no changes', () => {
        class A {
            b: number = 123;
        }
        model(A)
        class AppState {
            a: A = new A();
        }
        model(AppState)

        const di = createPureStateDi(new AppState())
        const fn = sinon.spy(v => v)
        const MyDep = factory(A)(fn)
        di.get(MyDep)
        di.get(MyDep)
        assert(fn.calledOnce)
    })

    it('should not hit, if a.b changed', () => {
        class A {
            b: number = 123;
            copy(rec: {b: number}): A {
                const next = new A()
                next.b = rec.b
                return next
            }
        }
        model(A)

        class AppState {
            a: A = new A();
            copy(rec: {a: A}): AppState {
                const next = new AppState()
                next.a = rec.a
                return next
            }
        }
        model(AppState)

        function abSetter(a: A): (b: number) => A {
            return function abSet(b: number): A {
                return a.copy({b})
            }
        }
        setter(A, A)(abSetter)

        const di = createPureStateDi(new AppState())
        const fn = sinon.spy(v => v)
        factory(A)(fn)
        const abSet = di.get(abSetter)

        di.get(fn)
        abSet(321)
        di.get(fn)

        assert(fn.calledTwice)
        assert(fn.firstCall.calledWith({b: 123}))
        assert(fn.secondCall.calledWith({b: 321}))
    })

    it('should hit, if a.c changed', () => {
        class C {
            v: string = 'test';
            copy(rec: {v: string}): C {
                const next = new C()
                next.v = rec.v
                return next
            }
        }
        model(C)

        class B {
            v: number = '123';
            copy(rec: {v: number}): B {
                const next = new B()
                next.v = rec.v
                return next
            }
        }
        model(B)

        class A {
            b: B = new B();
            c: C = new C();
            copy(rec: {b: B, c: C}): A {
                const next = new A()
                next.b = rec.b
                next.c = rec.c
                return next
            }
        }
        model(A)

        class AppState {
            a: A = new A();
            copy(rec: {a: A}): AppState {
                const next = new AppState()
                next.a = rec.a
                return next
            }
        }
        model(AppState)

        function acSetter(c: C): (v: string) => C {
            return function acSet(v: string): C {
                return c.copy({v})
            }
        }
        setter(C, C)(acSetter)

        const di = createPureStateDi(new AppState())
        const fn = sinon.spy(v => v)
        const MyDep = factory(B)(fn)
        const acSet = di.get(acSetter)
        di.get(MyDep)
        acSet('test2')
        di.get(MyDep)
        assert(fn.calledOnce)
    })

    it('should not hit, if a changed', () => {
        class C {
            v: string = 'test';
            copy(rec: {v: string}): C {
                const next = new C()
                next.v = rec.v
                return next
            }
        }
        model(C)

        class B {
            v: number = '123';
            copy(rec: {v: number}): B {
                const next = new B()
                next.v = rec.v
                return next
            }
        }
        model(B)

        class A {
            b: B = new B();
            c: C = new C();
            copy(rec: {b: B, c: C}): A {
                const next = new A()
                next.b = rec.b
                next.c = rec.c
                return next
            }
        }
        model(A)

        class AppState {
            a: A = new A();
            copy(rec: {a: A}): AppState {
                const next = new AppState()
                next.a = rec.a
                return next
            }
        }
        model(AppState)

        function aSetter(a: A): (rec: {b: B, c: C}) => A {
            return function aSet(rec: {b: B, c: C}): A {
                return a.copy(rec)
            }
        }
        setter(A, A)(aSetter)

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
