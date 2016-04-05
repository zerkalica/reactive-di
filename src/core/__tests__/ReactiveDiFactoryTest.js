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


describe('ReactiveDiFactoryTest', () => {
    let di: ReactiveDi;
    beforeEach(() => {
        di = new ReactiveDi(defaultPlugins)
    })

    it('should resolve function factory with deps', () => {
        function MyValue() {}

        function _myFn(a: number, b: number, c: number): number {
            return a + b + c
        }
        const myFn = sinon.spy(_myFn)

        const newDi = di.create([
            value(MyValue, 2),
            factory(myFn, MyValue)
        ])

        const result = newDi.get(myFn)

        assert(result(1, 1) === 4)
        assert(result(1, 2) === 5)
        assert(myFn.calledTwice)
    })
})
