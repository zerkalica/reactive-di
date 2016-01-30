/* eslint-env mocha */
/* @flow */
import assert from 'power-assert'
import SymbolMetaDriver from '../SymbolMetaDriver'
import {FactoryAnnotationImpl} from '../../annotations/annotationImpl'

describe('SymbolMetaDriverTest', () => {
    it('shoud set/get DepMeta', () => {
        function fn() {}
        const meta = new FactoryAnnotationImpl(fn, [], null, null)
        const driver = new SymbolMetaDriver()
        driver.annotate(fn, meta)
        assert(driver.getAnnotation(fn) === meta)
    })
})
