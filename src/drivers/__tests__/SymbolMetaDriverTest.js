/* eslint-env mocha */
/* @flow */
import assert from 'power-assert'
import SymbolMetaDriver from '~/drivers/SymbolMetaDriver'
import FactoryAnnotationImpl from '~/plugins/factory/FactoryAnnotationImpl'

describe('SymbolMetaDriverTest', () => {
    it('shoud set/get DepMeta', () => {
        function fn() {}
        const meta = new FactoryAnnotationImpl('id1', fn, null, [])
        const driver = new SymbolMetaDriver()
        driver.annotate(fn, meta)
        assert(driver.getAnnotation(fn) === meta)
    })
})
