/* @flow */

import annotations from '~/__tests__/annotations'
import merge from '~/utils/merge'
const {
    model,
    setter
} = annotations

export function createState(): {
    A: Function,
    B: Function,
    C: Function,
    AppState: Function,
    aSetter: Function,
    bSetter: Function,
    cSetter: Function
} {
    class C {
        v: string;
        constructor(rec: {v?: string} = {}) {
            this.v = rec.v || 'test'
        }
    }
    model(C)

    class B {
        v: number;
        constructor(rec: {v?: number} = {}) {
            this.v = rec.v || 123
        }
    }
    model(B)

    class A {
        b: B;
        c: C;
        v: number = 123;
        constructor(rec: {b?: B, c?: C, v?: number} = {}) {
            this.b = rec.b || new B()
            this.c = rec.c || new C()
            this.v = rec.v || 123
        }
    }
    model(A)

    class AppState {
        a: A = new A();
        constructor(rec: {a?: A} = {}) {
            this.a = rec.a || new A()
        }
    }
    model(AppState)

    function aSetter(a: A, b: B): A {
        return merge(a, {b})
    }
    setter(A)(aSetter)

    function bSetter(b: B, v: number): B {
        return merge(b, {v})
    }
    setter(B)(bSetter)

    function cSetter(c: C, v: string): C {
        return merge(c, {v})
    }
    setter(C)(cSetter)

    return {
        A,
        B,
        C,
        AppState,
        aSetter,
        bSetter,
        cSetter
    }
}
