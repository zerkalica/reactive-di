/* eslint-env mocha */
/* @flow */
import assert from 'power-assert'
import SymbolMetaDriver from 'reactive-di/drivers/SymbolMetaDriver'
import {factory} from 'reactive-di/plugins/factory/factory'

describe('SymbolMetaDriverTest', () => {
    it('shoud set/get DepMeta', () => {
        function fn() {}
        const meta = factory(fn)
        const driver = new SymbolMetaDriver()
        driver.annotate(fn, meta)
        assert(driver.getAnnotation(fn) === meta)
    })
})
