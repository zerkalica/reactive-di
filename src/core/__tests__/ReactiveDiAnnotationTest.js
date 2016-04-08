/* @flow */
/* eslint-env mocha */

import sinon from 'sinon'
import assert from 'power-assert'

import {
    createDummyRelationUpdater,
    ReactiveDi,
    defaultPlugins
} from 'reactive-di/index'

import {
    alias,
    factory,
    facet,
    klass
} from 'reactive-di/annotations'

describe('ReactiveDiAnnotationTest', () => {
    let di: ReactiveDi;

    beforeEach(() => {
        di = new ReactiveDi(defaultPlugins, createDummyRelationUpdater)
    })

    it('should resolve function factory once', () => {
        function _myFn(): number {
            return 123
        }
        const myFn = sinon.spy(_myFn)
        facet()(myFn)

        const newDi = di
        const result = newDi.get(myFn)

        assert(result === 123)
    })
})
