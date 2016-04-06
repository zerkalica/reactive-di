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


describe('ReactiveDiCacheTest', () => {
    let di: ReactiveDi;

    beforeEach(() => {
        di = new ReactiveDi(defaultPlugins)
    })

    it('should resolve function factory once', () => {
        function _myFn(): number {
            return 123
        }
        const myFn = sinon.spy(_myFn)

        const newDi = di.create([
            facet(myFn)
        ])
        newDi.get(myFn)
        newDi.get(myFn)

        assert(myFn.calledOnce)
    })
})
