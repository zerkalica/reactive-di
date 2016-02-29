/* @flow */

import annotations from 'reactive-di/__tests__/annotations'
import createPureStateDi from 'reactive-di/createPureStateDi'
import defaultPlugins from 'reactive-di/defaultPlugins'

import merge from 'reactive-di/utils/merge'
const {
    model,
    syncsetter
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
    syncsetter(A)(aSetter)

    function bSetter(b: B, v: number): B {
        return merge(b, {v})
    }
    syncsetter(B)(bSetter)

    function cSetter(c: C, v: string): C {
        return merge(c, {v})
    }
    syncsetter(C)(cSetter)

    const di = createPureStateDi(new AppState(), [], defaultPlugins);

    return {
        A,
        B,
        C,
        di,
        AppState,
        aSetter,
        bSetter,
        cSetter
    }
}
