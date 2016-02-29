/* @flow */

import {
    createFactory,
    createKlass,
    createModel,
    createLoader,
    createMeta,
    createObservable,
    createAsyncSetter,
    createSyncSetter
} from 'reactive-di/annotations'
import SymbolMetaDriver from 'reactive-di/drivers/SymbolMetaDriver'
import type {
    AnnotationDriver
} from 'reactive-di/i/annotationInterfaces'

const driver: AnnotationDriver = new SymbolMetaDriver();

export default {
    loader: createLoader(driver),
    factory: createFactory(driver),
    klass: createKlass(driver),
    model: createModel(driver),
    meta: createMeta(driver),
    observable: createObservable(driver),
    asyncsetter: createAsyncSetter(driver),
    syncsetter: createSyncSetter(driver)
}
