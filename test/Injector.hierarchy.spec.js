// @flow

import assert from 'assert'
import Injector from '../src/Injector'

describe('Injector.hierarchy', () => {
    class B {}
    class A {
        b: B
        static deps = [B]
        constructor(b: B) {
            this.b = b
        }
    }

    it('dependency resolved from parent, if already exists in parent', () => {
        const parent = new Injector()
        const child = parent.copy('child')

        const aParent: A = parent.value(A)
        const aChild: A = child.value(A)

        assert(aChild.b === aParent.b)
    })

    it('dependency resolved from child, if not exists in parent', () => {
        const parent = new Injector()
        const child = parent.copy('child')

        const aChild: A = child.value(A)
        const aParent: A = parent.value(A)
        assert(aParent !== aChild)
    })
})
