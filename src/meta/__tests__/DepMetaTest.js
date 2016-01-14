/* eslint-env mocha */
/* @flow */
import assert from 'power-assert'
import DepMeta from '../DepMeta'

describe('DepMetaTest', () => {
    it('shoud has default non-empty id', () => {
        const depMeta = new DepMeta({})
        assert.ok(depMeta.id)
    })
})
