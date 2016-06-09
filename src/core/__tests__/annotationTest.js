/* @flow */
/* eslint-env mocha */

import sinon from 'sinon'
import assert from 'power-assert'

import {
    createContainer
} from 'reactive-di/core/__tests__/createContainer'

import type {
    Container
} from 'reactive-di'

import {
    factory,
    klass
} from 'reactive-di/annotations'

import {
    paramtypes
} from 'reactive-di/core/annotationDriver'

import {
    klass as klassC
} from 'reactive-di/configurations'

function inject(meta, target: Function) {
    paramtypes.set(target, meta)
}

describe('DiContainerAnnotationTest', () => {
    it('should resolve function factory once', () => {
        function _myFn(): number {
            return 123
        }
        const myFn = sinon.spy(_myFn)
        factory()(myFn)

        const newDi: Container = createContainer([myFn]);
        const result = newDi.get(myFn)

        assert(result === 123)
    })

    it('should could not resolve class via annotations without registration', () => {
        class A {}
        klass()(A)
        inject([], A)

        class B {
            a: A;
            constructor(a: A) {
                this.a = a
            }
        }
        klass()(B)
        inject([A], B)

        const newDi: Container = createContainer();
        assert.throws(() => {
            newDi.get(B)
        })
    })

    it('should resolve class via annotations with registration', () => {
        class A {}
        klass()(A)
        inject([], A)

        class B {
            a: A;
            constructor(a: A) {
                this.a = a
            }
        }
        klass()(B)
        inject([A], B)

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
        inject([], A)

        class B {
            a: A;
            constructor(a: A) {
                this.a = a
            }
        }
        inject([A], B)

        const newDi: Container = createContainer([
            klassC(A),
            klassC(B)
        ]);
        const result = newDi.get(B)
        assert(result instanceof B)
        assert(result.a instanceof A)
    })
})
