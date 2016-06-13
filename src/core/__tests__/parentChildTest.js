/* @flow */
/* eslint-env mocha */

import type {
    Container
} from 'reactive-di'

import assert from 'power-assert'
import {
    createContainer
} from 'reactive-di/core/__tests__/createContainer'
import {
    klass
} from 'reactive-di/annotations'

describe('DiContainerParentChildTest', () => {
    it('should get dependency from parent first', () => {
        class A {}
        klass()(A)

        class B {}
        klass()(B)

        const Dep = 'key'

        const parentDi: Container = createContainer([
            [Dep, (A: Function)]
        ]).createContainer()

        const newDi: Container = createContainer([
            [Dep, (B: Function)]
        ]).createContainer(parentDi)

        assert(newDi.get(Dep) instanceof A)
    })

    it('child dependency in chain is parent instance', () => {
        class A {}
        klass()(A)

        class B {}
        klass()(B)

        const Dep = 'key'

        const parentDi: Container = createContainer([
            [Dep, (A: Function)]
        ]).createContainer()

        const newDi: Container = createContainer([
            [Dep, (B: Function)]
        ]).createContainer(parentDi)
        const a1: A = newDi.get(Dep)
        const a2: A = parentDi.get(Dep)
        assert(a1 instanceof A)
        assert(a2 instanceof A)
        assert(a1 === a2)
    })
})
