/* @flow */

/* eslint-disable no-unused-vars */

import merge from '../utils/merge'
import promiseToObservable from '../utils/promiseToObservable'
import ObserverCursor from './ObserverCursor'
import EntityMetaImpl, {updateMeta} from './impl/EntityMetaImpl'
import type {
    Info,
    DepFn,
    Loader
} from '../annotations/annotationInterfaces'
import type {SimpleMap} from '../modelInterfaces'
import type {
    Subscription,
    Observable,
    Observer
} from '../observableInterfaces'
import {createObjectProxy, createFunctionProxy} from '../utils/createProxy'
import type {MiddlewareFn, MiddlewareMap} from '../utils/createProxy'
import {fastCreateObject, fastCall} from '../utils/fastCall'
import type {
    AnyDep,
    EntityMeta,
    DepProcessor,
    ClassDep,
    LoaderDep,
    FactoryDep,
    ModelDep,
    ModelState,
    MetaDep,
    SetterDep
} from './nodeInterfaces'
/* eslint-enable no-unused-vars */

function getDeps(
    dep: ClassDep|FactoryDep,
    acc: DepProcessor
): {
    deps: Array<AnyDep|SimpleMap<string, AnyDep>>,
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
        updateMeta(meta, childDep.base.meta)
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

function resolveFactory<V, E>(
    factoryDep: FactoryDep<V, E>,
    acc: DepProcessor
): void {
    const {base} = factoryDep
    const {deps, meta} = getDeps(factoryDep, acc)
    let result: V = fastCall(factoryDep.fn, deps);
    if (factoryDep.middlewares) {
        if (typeof result !== 'function') {
            throw new Error('Not a function returned from dep ' + base.info.displayName)
        }
        result = createFunctionProxy(result, resolveMiddlewares(factoryDep.middlewares, acc))
    }
    factoryDep.hooks.onUpdate(base.value, result)
    base.isRecalculate = false
    base.value = result
    base.meta = meta
}


function resolveClass<V: Object, E>(
    classDep: ClassDep<V, E>,
    acc: DepProcessor
): void {
    const {deps, meta} = getDeps(classDep, acc)
    let obj: V = fastCreateObject(classDep.proto, deps);
    if (classDep.middlewares) {
        obj = createObjectProxy(obj, resolveMiddlewares(classDep.middlewares, acc))
    }
    const {base} = classDep
    classDep.hooks.onUpdate(base.value, obj)
    base.isRecalculate = false
    base.value = obj
    base.meta = meta
}

function resolveMeta(metaDep: MetaDep): void {
    const {base} = metaDep
    base.isRecalculate = false
    base.value = metaDep.source.base.meta
}

function resolveLoader<V: any, E>(
    loaderDep: LoaderDep<V, E>,
    acc: DepProcessor
): void {
    const {base} = loaderDep
    const {deps, meta} = getDeps(loaderDep, acc)
    base.meta = meta
    if (!meta.fulfilled) {
        return
    }

    let fn: Loader<V, E> = loaderDep.fn;
    if (loaderDep.middlewares) {
        fn = createFunctionProxy(fn, resolveMiddlewares(loaderDep.middlewares, acc))
    }
    const result: Observable = promiseToObservable(fastCall(fn, deps));
    loaderDep.hooks.onUpdate(base.value, result)
    base.isRecalculate = false
    base.value = result
}

function resolveModel<V: Object, E>(
    modelDep: ModelDep<V, E>,
    acc: DepProcessor
): void {
    const {base, updater} = modelDep
    const newMeta: EntityMeta = new EntityMetaImpl();
    const childs = modelDep.childs
    let isChanged: boolean = false;
    for (let i = 0, l = childs.length; i < l; i++) {
        if (updateMeta(newMeta, childs[i].base.meta)) {
            isChanged = true
        }
    }
    if (updater) {
        if (updateMeta(newMeta, updater.meta)) {
            isChanged = true
        }
        if (updater.isDirty) {
            const state: ModelState<V, E> = modelDep.state;
            state.pending()
            const value: Observable<V, E> = acc.resolve(updater.loader);
            if (updater.observable !== value) {
                const subscription: Subscription = updater.subscription;
                subscription.unsubscribe()
                updater.subscription = value.subscribe(new ObserverCursor(state))
                updater.isDirty = false
                updater.observable = value
            }
        }
    }
    if (isChanged) {
        base.meta = newMeta
    }
    base.isRecalculate = false
    base.value = modelDep.get()
}

function resolveSetter<V: Object, E>(
    setterDep: SetterDep<V, E>,
    acc: DepProcessor
): void {
    const {base} = setterDep
    const {deps, meta} = getDeps(setterDep, acc)
    let result: V = fastCall(setterDep.fn, deps);

    if (typeof result !== 'function') {
        throw new Error('Not a function returned from dep ' + base.info.displayName)
    }
    result = createFunctionProxy(
        result,
        setterDep.middlewares
            ? [setterDep.set].concat(
                resolveMiddlewares(setterDep.middlewares, acc)
            )
            : [setterDep.set]
    )
    setterDep.hooks.onUpdate(base.value, result)
    base.isRecalculate = false
    base.value = result
    base.meta = meta
}

export default {
    loader: resolveLoader,
    model: resolveModel,
    meta: resolveMeta,
    class: resolveClass,
    factory: resolveFactory,
    setter: resolveSetter
}
