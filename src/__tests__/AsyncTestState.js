/* @flow */

import annotations from './annotations'
import type {Observable} from '../interfaces/observableInterfaces'
import promiseToObservable from '../utils/promiseToObservable'

const {
    model,
    asyncmodel,
    loader,
    setter
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
    asyncmodel(C)

    function cLoader(c: C): Observable<C, Error> {
        return promiseToObservable(Promise.resolve(c.copy({v: 'test2'})))
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
    asyncmodel(A)

    class AppState {
        a: A = new A();
        copy(rec: {a?: A}): AppState {
            const next = new AppState()
            next.a = rec.a || this.a
            return next
        }
    }
    model(AppState)

    function aSetter(a: A, v: number): Observable<A, Error> {
        return promiseToObservable(Promise.resolve(a.copy({v})))
    }
    setter(A)(aSetter)

    function bSetter(b: B, v: number): B {
        return b.copy({v})
    }
    setter(B)(bSetter)

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
