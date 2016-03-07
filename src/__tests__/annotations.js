/* @flow */

import {
    factoryAnnotation,
    klassAnnotation,
    modelAnnotation,
    loaderAnnotation,
    meta,
    observableAnnotation,
    asyncsetterAnnotation,
    syncsetterAnnotation
} from 'reactive-di/annotations'

export default {
    loader: loaderAnnotation,
    factory: factoryAnnotation,
    klass: klassAnnotation,
    model: modelAnnotation,
    meta,
    observable: observableAnnotation,
    asyncsetter: asyncsetterAnnotation,
    syncsetter: syncsetterAnnotation
}
