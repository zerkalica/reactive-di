/* @flow */
import type {
    Cacheable,
    EntityMeta,
    MetaSource,
    DepProcessor,

    ModelDep,
    AsyncModelDep,
    ClassDep,
    FactoryDep,
    MetaDep,
    SetterDep,
    LoaderDep,
} from './nodeInterfaces'

import type {
    AsyncResult,
    SetterResult,
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

export function modelDep<V: Object>(
    dep: ModelDep<V>,
    acc: DepProcessor
): void {
    dep.base.isRecalculate = false
    dep.base.value = dep.get()
}

export function asyncModelDep<V: Object, E>(
    dep: AsyncModelDep<V, E>,
    acc: DepProcessor
): void {
    dep.base.isRecalculate = false
    dep.base.value = dep.get()
}

export function classDep<V: Object>(
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

export function factoryDep<V: Object>(
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

export function resolveMeta<E>(
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

export function resolveSetter<V: Object, E>(
    dep: SetterDep<V, E>,
    acc: DepProcessor
): void {
    const {base, invoker} = dep
    const {deps, middlewares} = resolveDeps(invoker.depArgs, acc)
    let fn: SetterResult<V, E> = fastCall(invoker.target, deps);
    if (typeof fn !== 'function') {
        throw new Error('No callable returns from dep ' + base.info.displayName)
    }
    fn = createFunctionProxy(fn, [dep.set].concat(middlewares || []))
    base.isRecalculate = false
    base.value = fn
}

export function resolveLoader<V: Object, E>(
    dep: LoaderDep<V, E>,
    acc: DepProcessor
): void {
    const {base, invoker} = dep
    const {deps, middlewares} = resolveDeps(invoker.depArgs, acc)
    const observableOrPromise: AsyncResult<V, E> = fastCall(invoker.target, deps);
    if (base.value === observableOrPromise) {
        base.isRecalculate = false
        return
    }
    base.value = observableOrPromise
    dep.set(observableOrPromise)
    base.isRecalculate = false
}
