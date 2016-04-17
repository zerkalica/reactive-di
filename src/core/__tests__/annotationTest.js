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
    factory
} from 'reactive-di/annotations'

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
})
