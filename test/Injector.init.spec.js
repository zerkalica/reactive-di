// @flow

import assert from 'assert'
import Injector from '../src/Injector'


describe('Injector.init', () => {
    class B {}
    class A {
        b: B
        static deps = [B]
        constructor(b: B) {
            this.b = b
        }
    }

    it('recursive autoresolve deps', () => {
        const injector = new Injector()
        const a: A = injector.value(A)
        assert(a instanceof A)
        assert(a.b instanceof B)
    })

    it('cache dependency', () => {
        const injector = new Injector()
        const a1: A = injector.value(A)
        const a2: A = injector.value(A)
        assert(a1 === a2)
    })

    it('register class => instance', () => {
        const b = new B()
        const injector = new Injector([
            [B, b]
        ])
        const a: A = injector.value(A)
        assert(a.b === b)
    })

    it('register instance', () => {
        const b = new B()
        const injector = new Injector([
            b
        ])
        const a: A = injector.value(A)
        assert(a.b === b)
    })
})
