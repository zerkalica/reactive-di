/* @flow */

import EntityMetaImpl, {updateMeta} from './impl/EntityMetaImpl'
import {createObjectProxy, createFunctionProxy} from '../utils/createProxy'
/* eslint-disable no-unused-vars */
import type {MiddlewareFn, MiddlewareMap} from '../utils/createProxy'
/* eslint-enable no-unused-vars */
import {fastCreateObject, fastCall} from '../utils/fastCall'
import type {
    AnyDep,
    Processor,
    IEntityMeta,
    ClassDep,
    FactoryDep,
    ModelDep,
    MetaDep,
    SetterDep
} from './nodeInterfaces'

function getDeps(
    dep: ClassDep|FactoryDep,
    acc: Processor
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

function resolveMiddlewares<A: ClassDep | FactoryDep, B: MiddlewareMap | MiddlewareFn>(
    middlewares: Array<A>,
    acc: Processor
): Array<B> {
    const mdls: Array<B> = [];
    for (let i = 0, j = middlewares.length; i < j; i++) {
        const mdl: A = middlewares[i];
        mdls.push(acc.resolve(mdl))
    }
    return mdls
}

export function resolveFactory<T>(
    factoryDep: FactoryDep<T>,
    acc: Processor
): void {
    const {info, cache} = factoryDep
    const deps = getDeps(factoryDep, acc)
    let result: T = fastCall(factoryDep.fn, deps);
    if (factoryDep.middlewares) {
        if (typeof result !== 'function') {
            throw new Error('Not a function returned from dep ' + info.displayName)
        }
        result = createFunctionProxy(result, resolveMiddlewares(factoryDep.middlewares, acc))
    }
    factoryDep.hooks.onUpdate(cache.value, result)
    cache.isRecalculate = false
    cache.value = result
}

export function resolveClass<T: Object>(
    classDep: ClassDep<T>,
    acc: Processor
): void {
    const deps = getDeps(classDep, acc)
    let obj = fastCreateObject(classDep.proto, deps);
    if (classDep.middlewares) {
        obj = createObjectProxy(obj, resolveMiddlewares(classDep.middlewares, acc))
    }
    const {cache} = classDep
    classDep.hooks.onUpdate(cache.value, obj)
    cache.isRecalculate = false
    cache.value = obj
}

export function resolveMeta(metaDep: MetaDep): void {
    const {sources, cache} = metaDep
    const newMeta: IEntityMeta = new EntityMetaImpl();
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

export function resolveModel<T: Object>(modelDep: ModelDep<T>): void {
    const {cache} = modelDep
    cache.isRecalculate = false
    cache.value = modelDep.get()
}

export function resolveSetter<T: Function, M>(
    setterDep: SetterDep<T, M>,
    acc: Processor
): void {
    const {info, cache} = setterDep
    const value = acc.resolve(setterDep.facet)
    if (typeof value !== 'function') {
        throw new Error('Not a function returned from dep ' + info.displayName)
    }
    cache.isRecalculate = false
    cache.value = createFunctionProxy(value, [setterDep.set])
}
