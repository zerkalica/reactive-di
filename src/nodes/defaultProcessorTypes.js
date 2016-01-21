/* @flow */

import promiseToObservable from '../utils/promiseToObservable'
import EntityMetaImpl, {updateMeta, recalcMeta} from './impl/EntityMetaImpl'
/* eslint-disable no-unused-vars */
import type {Info, DepFn} from '../annotations/annotationInterfaces'
/* eslint-enable no-unused-vars */
import {createObjectProxy, createFunctionProxy} from '../utils/createProxy'
/* eslint-disable no-unused-vars */
import type {MiddlewareFn, MiddlewareMap} from '../utils/createProxy'
/* eslint-enable no-unused-vars */
import {fastCreateObject, fastCall} from '../utils/fastCall'
import type {
    AnyDep,
    EntityMeta,
    DepProcessor,
    ClassDep,
    FactoryDep,
    ModelDep,
    ModelState,
    MetaDep,
    SetterDep
} from './nodeInterfaces'

/* eslint-disable no-unused-vars */
import type {Subscription, Observable, Observer} from '../observableInterfaces'
/* eslint-enable no-unused-vars */
import ObserverCursor from './ObserverCursor'

function getDeps(
    dep: ClassDep|FactoryDep,
    acc: DepProcessor
): {
    deps: Array<AnyDep|{[prop: string]: AnyDep}>,
    meta: EntityMeta
} {
    const {deps} = dep;
    const depNames: ?Array<string> = dep.depNames;
    const argsArray = []
    const argsObject = {}
    const meta: EntityMeta = new EntityMetaImpl();
    for (let i = 0, j = deps.length; i < j; i++) {
        const childDep = deps[i]
        const value = acc.resolve(childDep)
        updateMeta(meta, childDep.cache.meta)
        if (depNames) {
            argsObject[depNames[i]] = value
        } else {
            argsArray.push(value)
        }
    }

    return {
        deps: depNames ? [argsObject] : argsArray,
        meta
    }
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

function createAsyncNotReadyWarning(info: Info): () => void {
    return function asyncNotReadyWarning(): void {
        throw new Error('Dep marked as async, and can\'t be used as dependency: ' + info.displayName)
    }
}

function resolveFactory<A, T: DepFn<A>>(
    factoryDep: FactoryDep<A, T>,
    acc: DepProcessor
): void {
    const {info, cache} = factoryDep
    const {deps, meta} = getDeps(factoryDep, acc)
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

    cache.meta = meta
}


function resolveClass<T: Object>(
    classDep: ClassDep<T>,
    acc: DepProcessor
): void {
    const {deps, meta} = getDeps(classDep, acc)
    let obj: T = fastCreateObject(classDep.proto, deps);
    if (classDep.middlewares) {
        obj = createObjectProxy(obj, resolveMiddlewares(classDep.middlewares, acc))
    }
    const {cache} = classDep
    classDep.hooks.onUpdate(cache.value, obj)
    cache.isRecalculate = false
    cache.value = obj
    cache.meta = meta
}

function resolveMeta(metaDep: MetaDep): void {
    const {cache} = metaDep
    cache.isRecalculate = false
    cache.value = metaDep.source.cache.meta
}

function resolveLoader<A: Observable, T: DepFn<A>>(
    loaderDep: LoaderDep<A, T>,
    acc: DepProcessor
): void {
    const {cache} = loaderDep
    const {deps, meta} = getDeps(loaderDep, acc)
    if (!meta.fulfilled) {
        cache.value = null
        cache.meta = meta
        return
    }

    let fn: (...x: any) => Observable|Promise = loaderDep.fn;
    if (loaderDep.middlewares) {
        fn = createFunctionProxy(fn, resolveMiddlewares(loaderDep.middlewares, acc))
    }
    const result: A = promiseToObservable(fastCall(fn, deps));
    loaderDep.hooks.onUpdate(cache.value, result)
    cache.isRecalculate = false
    cache.value = result
    cache.meta = meta
}

function resolveModel<T: Object>(
    modelDep: ModelDep<T>,
    acc: DepProcessor
): void {
    const {cache, updater} = modelDep

    cache.meta = recalcMeta(cache.meta, modelDep.childs)

    if (updater && updater.isDirty) {
        const state: ModelState<T> = modelDep.state;
        state.pending()
        const value: ?Observable = acc.resolve(updater.loader);
        if (value) {
            const subscription: Subscription = updater.subscription;
            subscription.unsubscribe()
            updater.subscription = value.subscribe(new ObserverCursor(state))
            updater.isDirty = false
        }
    }
    cache.isRecalculate = false
    cache.value = modelDep.get()
}

function resolveSetter<A: (...x: any) => void, T: DepFn<A>>(
    setterDep: SetterDep<A, T>,
    acc: DepProcessor
): void {
    const facet = setterDep.facet
    const value: (...x: any) => void = acc.resolve(facet);
    if (typeof value !== 'function') {
        throw new Error('Not a function returned from dep ' + setterDep.info.displayName)
    }
    const cache = setterDep.cache
    cache.isRecalculate = false
    cache.value = createFunctionProxy(value, [setterDep.set])
    cache.meta = facet.cache.meta
}

export default {
    loader: resolveLoader,
    model: resolveModel,
    meta: resolveMeta,
    class: resolveClass,
    factory: resolveFactory,
    setter: resolveSetter
}
