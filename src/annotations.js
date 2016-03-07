/* @flow */

import {klassAnnotation, klass} from 'reactive-di/plugins/class/klass'
import {factoryAnnotation, factory} from 'reactive-di/plugins/factory/factory'
import {meta} from 'reactive-di/plugins/meta/meta'
import {modelAnnotation, model} from 'reactive-di/plugins/model/model'
import {
    loaderAnnotation,
    loader,
    pendingLoader,
    pendingLoaderAnnotation
} from 'reactive-di/plugins/loader/loader'
import {resetAnnotation, reset} from 'reactive-di/plugins/loader/reset'
import {observableAnnotation, observable} from 'reactive-di/plugins/observable/observable'
import {asyncsetterAnnotation, asyncsetter} from 'reactive-di/plugins/setter/asyncsetter'
import {syncsetterAnnotation, syncsetter} from 'reactive-di/plugins/setter/syncsetter'
import {alias} from 'reactive-di/plugins/alias/alias'

export {
    alias,
    klass,
    klassAnnotation,
    meta,
    factoryAnnotation,
    factory,
    modelAnnotation,
    model,
    loaderAnnotation,
    loader,
    pendingLoader,
    pendingLoaderAnnotation,
    resetAnnotation,
    reset,
    observableAnnotation,
    observable,
    asyncsetterAnnotation,
    asyncsetter,
    syncsetterAnnotation,
    syncsetter
}
