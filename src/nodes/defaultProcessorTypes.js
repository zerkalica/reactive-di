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

function modelDep<V: Object, E>(
    dep: ModelDep<V, E>,
    acc: DepProcessor
): void {
    const {base, updater, loader} = dep
    if (updater && loader && !updater.isSubscribed) {
        updater.subscribe((acc.resolve(loader): Observable<V, E>))
    }

    base.isRecalculate = false
    base.value = dep.get()
}

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

function factoryDep<V: Object>(
    dep: FactoryDep<V>,
    acc: DepProcessor
): void {
    const {base, invoker} = dep
    const {deps, middlewares} = resolveDeps(invoker.depArgs, acc)
    let fn: V = fastCall(invoker.target, deps);
    if (middlewares) {
        if (typeof fn !== 'function') {
            throw new Error('No callable returns from dep ' + base.info.displayName)
        }
        fn = createFunctionProxy(fn, middlewares)
    }
    base.value = fn
    base.isRecalculate = false
}

function metaDep<E>(
    dep: MetaDep<E>,
    acc: DepProcessor
): void {
    const {base, sources} = dep
    const meta: EntityMeta = new EntityMetaImpl();
    for (let i = 0, l = sources.length; i < l; i++) {
        updateMeta(meta, sources[i].meta)
    }
    base.value = merge(base.value, meta)
    base.isRecalculate = false
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
