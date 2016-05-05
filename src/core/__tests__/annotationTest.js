/* @flow */
/* eslint-env mocha */

import sinon from 'sinon'
import assert from 'power-assert'

import {
    createContainer
} from 'reactive-di/core/__tests__/createContainer'

import type {
    Container
} from 'reactive-di/i/coreInterfaces'

import {
    factory,
    klass,
    inject
} from 'reactive-di/annotations'

import {
    klass as klassC
} from 'reactive-di/configurations'

describe('DiContainerAnnotationTest', () => {
    it('should resolve function factory once', () => {
        function _myFn(): number {
            return 123
        }
        const myFn = sinon.spy(_myFn)
        factory()(myFn)

        const newDi: Container = createContainer();
        const result = newDi.get(myFn)

        assert(result === 123)
    })

    it('should resolve class via annotations without registration', () => {
        class A {}
        klass()(A)
        inject()(A)

        class B {
            a: A;
            constructor(a: A) {
                this.a = a
            }
        }
        klass()(B)
        inject(A)(B)

        const newDi: Container = createContainer();
        const result = newDi.get(B)
        assert(result instanceof B)
        assert(result.a instanceof A)
    })

    it('should resolve class via annotations with registration', () => {
        class A {}
        klass()(A)
        inject()(A)

        class B {
            a: A;
            constructor(a: A) {
                this.a = a
            }
        }
        klass()(B)
        inject(A)(B)

        const newDi: Container = createContainer([
            A,
            B
        ]);
        const result = newDi.get(B)
        assert(result instanceof B)
        assert(result.a instanceof A)
    })

    it('should resolve class with deps via config and partially annotations', () => {
        class A {}
        inject()(A)

        class B {
            a: A;
            constructor(a: A) {
                this.a = a
            }
        }
        inject(A)(B)

        const newDi: Container = createContainer([
            klassC(A),
            klassC(B)
        ]);
        const result = newDi.get(B)
        assert(result instanceof B)
        assert(result.a instanceof A)
    })
})
