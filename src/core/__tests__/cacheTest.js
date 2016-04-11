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
} from 'reactive-di/configurations'

describe('DiContainerCacheTest', () => {
    it('should resolve function factory once', () => {
        function _myFn(): number {
            return 123
        }
        const myFn = sinon.spy(_myFn)

        const newDi: Container = createContainer([
            factory(myFn)
        ])
        newDi.get(myFn)
        newDi.get(myFn)

        assert(myFn.calledOnce)
    })
})
