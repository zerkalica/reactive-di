/* @flow */

import annotations from 'reactive-di/__tests__/annotations'
import promiseToObservable from 'reactive-di/utils/promiseToObservable'
import type {AsyncResult} from 'reactive-di/i/plugins/setterInterfaces'

const {
    model,
    loader,
    syncsetter,
    asyncsetter
} = annotations

export function createState(): {
    A: Function,
    B: Function,
    C: Function,
    AppState: Function,
    aSetter: Function,
    bSetter: Function,
    cLoader: Function
} {
    class C {
        v: string = 'test';
        copy(rec: {v?: string}): C {
            const next = new C()
            next.v = rec.v || this.v
            return next
        }
    }
    model(C)

    function cLoader(c: C): AsyncResult<C, any> {
        return [c, Promise.resolve(c.copy({v: 'test2'}))]
    }
    loader(C)(cLoader)

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

    function aSetter(a: A, v: number): AsyncResult<A, Error> {
        return [a, promiseToObservable(Promise.resolve(a.copy({v})))]
    }
    asyncsetter(A)(aSetter)

    function bSetter(b: B, v: number): B {
        return b.copy({v})
    }
    syncsetter(B)(bSetter)

    return {
        A,
        B,
        C,
        cLoader,
        AppState,
        aSetter,
        bSetter
    }
}
