/* eslint-env mocha */
/* @flow */
import assert from 'power-assert'
import SymbolMetaDriver from '../SymbolMetaDriver'
import DepMeta from '../../DepMeta'

describe('SymbolMetaDriverTest', () => {
    it('shoud set/get DepMeta', () => {
        function a() {
        }
        const driver = new SymbolMetaDriver()
        const meta = new DepMeta({
            fn: () => null
        })
        driver.set(a, meta)
        assert(driver.get(a) === meta)
    })
})
