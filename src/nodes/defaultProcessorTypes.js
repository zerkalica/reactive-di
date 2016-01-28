/* @flow */
import type {
    Cacheable,
    EntityMeta,
    MetaSource,
    DepProcessor,

    ModelDep,
    ClassDep,
    FactoryDep,
    MetaDep,
    SetterDep
} from './nodeInterfaces'

import type {
    Setter,
    DepFn
} from '../annotations/annotationInterfaces'

import EntityMetaImpl, {updateMeta} from './impl/EntityMetaImpl'
import resolveDeps from './resolveDeps'
import {createObjectProxy, createFunctionProxy} from '../utils/createProxy'
import {fastCall, fastCreateObject} from '../utils/fastCall'
import promiseToObservable from '../utils/promiseToObservable'

import type {
    Observable
} from '../observableInterfaces'

import type {Cursor} from '../modelInterfaces'

function classDep<V: Object>(
    dep: ClassDep<V>,
    acc: DepProcessor
): void {
    const {base, invoker} = dep
    const {deps, middlewares} = resolveDeps(invoker.depArgs, acc)
    let obj: V = fastCreateObject(invoker.target, deps);
    if (middlewares) {
        obj = createObjectProxy(obj, middlewares)
    }
    base.isRecalculate = false
    base.value = obj
}

function setterDep<V: Object, E>(
    dep: SetterDep<V, E>,
    acc: DepProcessor
): void {
    const {base, invoker} = dep
    const {deps, middlewares} = resolveDeps(invoker.depArgs, acc)
    const fn: Setter<V> = fastCall(invoker.target, deps);
    if (typeof fn !== 'function') {
        throw new Error('No callable returns from dep ' + base.info.displayName)
    }
    base.isRecalculate = false
    base.value = createFunctionProxy(fn, [dep.set].concat(middlewares || []))
}

export default {
    model: modelDep,
    class: classDep,
    factory: factoryDep,
    meta: metaDep,
    setter: setterDep
}
