/* @flow */
/* eslint-env mocha */

import sinon from 'sinon'
import assert from 'power-assert'

import {
    ReactiveDi,
    defaultPlugins
} from 'reactive-di/index'

import {
    alias,
    factory,
    facet,
    klass,
    value,
    middleware
} from 'reactive-di/providers'

import {
    klass as klassAnn
} from 'reactive-di/annotations'


describe('ReactiveDiMiddlewareTest', () => {
    let di: ReactiveDi;
    beforeEach(() => {
        di = new ReactiveDi(defaultPlugins)
    })

    it('should log facet calls', () => {
        function MyValue() {}

        function myFn(a: number, b: number, c: number): number {
            return a + b + c
        }
        function _myFnMiddleware(result: number, a: number, b: number, c: number): void {
            // console.log(result, a, b, c)
        }

        const myFnMiddleware = sinon.spy(_myFnMiddleware)

        const newDi = di.create([
            value(MyValue, 2),
            factory(myFn, MyValue),
            factory(myFnMiddleware),
            middleware(myFnMiddleware, myFn)
        ])

        const result = newDi.get(myFn)
        result(1, 2)
        assert(myFnMiddleware.calledOnce)
        assert(myFnMiddleware.firstCall.calledWith(
            5, 2, 1, 2
        ))
    })
})
