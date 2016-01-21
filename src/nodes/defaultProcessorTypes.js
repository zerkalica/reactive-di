/* @flow */

import EntityMetaImpl, {updateMeta} from './impl/EntityMetaImpl'
import {createObjectProxy, createFunctionProxy} from '../utils/createProxy'
/* eslint-disable no-unused-vars */
import type {MiddlewareFn, MiddlewareMap} from '../utils/createProxy'
/* eslint-enable no-unused-vars */
import {fastCreateObject, fastCall} from '../utils/fastCall'
import type {
    AnyDep,
    DepProcessor,
    EntityMeta,
    ClassDep,
    FactoryDep,
    ModelDep,
    MetaDep,
    SetterDep
} from './nodeInterfaces'

/* eslint-disable no-unused-vars */
import type {
    DepFn
} from '../annotations/annotationInterfaces'
/* eslint-enable no-unused-vars */

function getDeps(
    dep: ClassDep|FactoryDep,
    acc: DepProcessor
): Array<AnyDep|{[prop: string]: AnyDep}> {
    const {deps} = dep;
    const depNames: ?Array<string> = dep.depNames;
    const argsArray = []
    const argsObject = {}
    for (let i = 0, j = deps.length; i < j; i++) {
        const childDep = deps[i]
        const value = acc.resolve(childDep)
        if (depNames) {
            argsObject[depNames[i]] = value
        } else {
            argsArray.push(value)
        }
    }

    return depNames ? [argsObject] : argsArray
}

function resolveMiddlewares<A: ClassDep|FactoryDep, B: MiddlewareMap|MiddlewareFn>(
    middlewares: Array<A>,
    acc: DepProcessor
): Array<B> {
    const mdls: Array<B> = [];
    for (let i = 0, j = middlewares.length; i < j; i++) {
        const mdl: A = middlewares[i];
        mdls.push(acc.resolve(mdl))
    }
    return mdls
}

function resolveFactory<A, T: DepFn<A>>(
    factoryDep: FactoryDep<A, T>,
    acc: DepProcessor
): void {
    const {info, cache} = factoryDep
    const deps = getDeps(factoryDep, acc)
    let result: A = fastCall(factoryDep.fn, deps);
    if (factoryDep.middlewares) {
        if (typeof result !== 'function') {
            throw new Error('Not a function returned from dep ' + info.displayName)
        }
        result = createFunctionProxy(result, resolveMiddlewares(factoryDep.middlewares, acc))
    }
    factoryDep.hooks.onUpdate(cache.value, result)
    cache.isRecalculate = false
    cache.value = result
    cache.meta = calcMeta(classDep.deps)
}

function resolveClass<T: Object>(
    classDep: ClassDep<T>,
    acc: DepProcessor
): void {
    const deps = getDeps(classDep, acc)
    let obj: T = fastCreateObject(classDep.proto, deps);
    if (classDep.middlewares) {
        obj = createObjectProxy(obj, resolveMiddlewares(classDep.middlewares, acc))
    }
    const {cache} = classDep
    classDep.hooks.onUpdate(cache.value, obj)
    cache.isRecalculate = false
    cache.value = obj
    cache.meta = calcMeta(classDep.deps)
}

function resolveMeta(metaDep: MetaDep): void {
    const {sources, cache} = metaDep
    const newMeta: EntityMeta = new EntityMetaImpl();
    let isChanged: boolean = false;
    for (let i = 0, l = sources.length; i < l; i++) {
        if (updateMeta(newMeta, sources[i].meta)) {
            isChanged = true
        }
    }
    if (isChanged) {
        cache.value = newMeta
    } else if (!cache.value) {
        cache.value = new EntityMetaImpl()
    }
    cache.isRecalculate = false
}

function resolveModel<T: Object>(modelDep: ModelDep<T>): void {
    const {cache} = modelDep
    cache.isRecalculate = false
    cache.value = modelDep.get()
    cache.meta = calcMeta(modelDep.childs, modelDep.meta)
}

function resolveSetter<A, T: DepFn<A>>(
    setterDep: SetterDep<A, T>,
    acc: DepProcessor
): void {
    const facet = setterDep.facet
    const value = acc.resolve(facet)
    if (typeof value !== 'function') {
        throw new Error('Not a function returned from dep ' + setterDep.info.displayName)
    }
    const cache = setterDep.cache
    cache.isRecalculate = false
    cache.value = createFunctionProxy(value, [setterDep.set])
}

function resolveLoader<A, T: DepFn<A>>(
    setterDep: LoaderDep<A, T>,
    acc: DepProcessor
): void {
    const facet = setterDep.facet
    const deps: Array<AnyDep> = facet.deps;

    let isFulfilled: boolean = true;
    for (let i = 0, l = deps.length; i < l; i++) {
        // todo: what if meta state is error ?
        if (!deps[i].cache.meta.fulfilled) {
            isFulfilled = false
        }
    }

    if (!isFulfilled) {
        return
    }

    const value = acc.resolve(facet)
    setterDep.set(value)

    const cache = setterDep.cache
    cache.isRecalculate = false
    cache.value = setterDep.get(value)
}

export default {
    model: resolveModel,
    meta: resolveMeta,
    class: resolveClass,
    factory: resolveFactory,
    setter: resolveSetter,
    loader: resolveLoader
}
