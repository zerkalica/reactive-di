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


describe('ReactiveDiFacetTest', () => {
    let di: ReactiveDi;
    beforeEach(() => {
        di = new ReactiveDi(defaultPlugins)
    })

    it('should resolve simple factory', () => {
        function _myFn(): number {
            return 123
        }
        const myFn = sinon.spy(_myFn)

        const newDi = di.create([
            facet(myFn)
        ])

        const result = newDi.get(myFn)

        assert(myFn.calledOnce)
        assert(result === 123)
    })

    it('should resolve factory with deps', () => {
        function MyValue() {}

        function _myFn(a: number): number {
            return 1 + a
        }
        const myFn = sinon.spy(_myFn)

        const newDi = di.create([
            value(MyValue, 2),
            facet(myFn, MyValue)
        ])

        const result = newDi.get(myFn)
        assert(myFn.calledOnce)
        assert(result === 3)
    })

    it('should process deps as map', () => {
        function MyValue() {}

        function _myFn({a, b}: {a: number, b: number}): number {
            return 1 + a + b
        }
        const myFn = sinon.spy(_myFn)

        const newDi = di.create([
            value(MyValue, {a: 1, b: 2}),
            facet(myFn, MyValue)
        ])

        const result = newDi.get(myFn)
        assert(myFn.calledOnce)
        assert(result === 4)
    })

    it('should create new class', () => {
        function MyValue() {}
        class MyClass {
            v: string;
            constructor(v: string) {
                this.v = v
            }
        }
        const newDi = di.create([
            value(MyValue, '123'),
            klass(MyClass, MyValue)
        ])
        const result = newDi.get(MyClass)
        assert(result instanceof MyClass)
        assert(result.v === '123')
    })
})
