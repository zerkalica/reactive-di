/* @flow */

import {createKlass, klass} from 'reactive-di/plugins/class/klass'
import {createFactory, factory} from 'reactive-di/plugins/factory/factory'
import {createMeta, meta} from 'reactive-di/plugins/meta/meta'
import {createModel, model} from 'reactive-di/plugins/model/model'
import {createLoader, loader} from 'reactive-di/plugins/loader/loader'
import {createReset, reset} from 'reactive-di/plugins/loader/reset'
import {createObservable, observable} from 'reactive-di/plugins/observable/observable'
import {createAsyncSetter, asyncsetter} from 'reactive-di/plugins/setter/asyncsetter'
import {createSyncSetter, syncsetter} from 'reactive-di/plugins/setter/syncsetter'

export {
    klass,
    createKlass,
    createMeta,
    meta,
    createFactory,
    factory,
    createModel,
    model,
    createLoader,
    loader,
    createReset,
    reset,
    createObservable,
    observable,
    createAsyncSetter,
    asyncsetter,
    createSyncSetter,
    syncsetter
}
