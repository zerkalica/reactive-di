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
    tag,
    compose,
    klass,
    value
} from 'reactive-di/configurations'

describe('DiContainerMiddlewareTest', () => {
    it('should log calls for compose', () => {
        function MyValue() {}

        function myFn(a: number, b: number, c: number): number {
            return a + b + c
        }
        function _myFnMiddleware(result: number, a: number, b: number, c: number): void {
            // console.log(result, a, b, c)
        }

        const myFnMiddleware = sinon.spy(_myFnMiddleware)

        const newDi: Container = createContainer([
            value(MyValue, 2),
            compose(myFn, MyValue),
            compose(myFnMiddleware)
        ], [
            [myFnMiddleware, [myFn]]
        ])

        const result = newDi.get(myFn)
        result(1, 2)
        assert(myFnMiddleware.calledOnce)
        assert(myFnMiddleware.firstCall.calledWith(
            5, 2, 1, 2
        ))
    })

    it('should log calls for klass', () => {
        class MyClass {
            test(a: number): number {
                return a + 1
            }

            test2(a: number): number {
                return a
            }
        }

        class MyClassMiddleware {
            test(result: number, a: number): void {
            }
        }

        const newDi: Container = createContainer([
            klass(MyClass),
            klass(MyClassMiddleware)
        ], [
            [MyClassMiddleware, [MyClass]]
        ])
        const testMethod = sinon.spy()
        newDi.get(MyClassMiddleware).test = testMethod
        const my = newDi.get(MyClass)
        my.test(1)
        my.test2(1)
        assert(testMethod.calledOnce)
        assert(testMethod.firstCall.calledWith(
            2, 1
        ))
    })

    it('should log compose calls by tag ', () => {
        function MyValue() {}

        function myFn(a: number, b: number, c: number): number {
            return a + b + c
        }
        function _myFnMiddleware(result: number, a: number, b: number, c: number): void {
            // console.log(result, a, b, c)
        }

        const myFnMiddleware = sinon.spy(_myFnMiddleware)

        const newDi: Container = createContainer([
            value(MyValue, 2),
            tag(compose(myFn, MyValue), 'mytag'),
            compose(myFnMiddleware)
        ], [
            [myFnMiddleware, ['mytag']]
        ])

        const result = newDi.get(myFn)
        result(1, 2)
        assert(myFnMiddleware.calledOnce)
        assert(myFnMiddleware.firstCall.calledWith(
            5, 2, 1, 2
        ))
    })
})
