/* @flow */

import EntityMeta, {updateMeta} from './EntityMeta'
import type {AnyDep, IEntityMeta, ClassDep, FactoryDep, ModelDep, MetaDep, SetterDep} from './nodeInterfaces'
import {createObjectProxy, createFunctionProxy} from '../utils/createProxy'
/* eslint-disable no-unused-vars */
import type {MiddlewareFn, MiddlewareMap} from '../utils/createProxy'
/* eslint-enable no-unused-vars */
import {fastCreateObject, fastCall} from '../utils/fastCall'

export default class DepProcessor {
    resolve(cacheRec: AnyDep): any {
        const {kind, cache} = cacheRec
        if (!cache.isRecalculate) {
            return cache.value
        }
        try {
            /* eslint-disable no-else-return */
            // Low-level perfomance optimisations
            if (kind <= 3) {
                if (kind === 1) {
                    return this.resolveModel(((cacheRec: any): ModelDep))
                }
                if (kind === 2) {
                    return this.resolveClass(((cacheRec: any): ClassDep))
                }
                return this.resolveFactory(((cacheRec: any): FactoryDep))
            } else {
                if (kind === 4) {
                    return this.resolveMeta(((cacheRec: any): MetaDep))
                }
                return this.resolveSetter(((cacheRec: any): SetterDep))
            }
            /* eslint-enable no-else-return */
        } catch (e) {
            e.message = e.message + ', ' + cacheRec.info.displayName
            throw e
        }
    }

    _getDeps(dep: ClassDep|FactoryDep): Array<AnyDep|{[prop: string]: AnyDep}> {
        const {deps} = dep;
        const depNames: ?Array<string> = dep.depNames;
        const argsArray = []
        const argsObject = {}
        for (let i = 0, j = deps.length; i < j; i++) {
            const childDep = deps[i]
            const value = this.resolve(childDep)
            if (depNames) {
                argsObject[depNames[i]] = value
            } else {
                argsArray.push(value)
            }
        }

        return depNames ? [argsObject] : argsArray
    }

    _resolveMiddlewares<A: ClassDep | FactoryDep, B: MiddlewareMap | MiddlewareFn>(middlewares: Array<A>): Array<B> {
        const mdls: Array<B> = [];
        for (let i = 0, j = middlewares.length; i < j; i++) {
            const mdl: A = middlewares[i];
            mdls.push(this.resolve(mdl))
        }
        return mdls
    }

    resolveFactory<T>(factoryDep: FactoryDep<T>): T {
        const {info, cache} = factoryDep
        const deps = this._getDeps(factoryDep)
        let result: T = fastCall(factoryDep.fn, deps);
        if (factoryDep.middlewares) {
            if (typeof result !== 'function') {
                throw new Error('Not a function returned from dep ' + info.displayName)
            }
            result = createFunctionProxy(result, this._resolveMiddlewares(factoryDep.middlewares))
        }
        factoryDep.hooks.onUpdate(cache.value, result)
        cache.isRecalculate = false
        cache.value = result
        return result
    }

    resolveClass<T: Object>(classDep: ClassDep<T>): T {
        const deps = this._getDeps(classDep)
        let obj = fastCreateObject(classDep.proto, deps);
        if (classDep.middlewares) {
            obj = createObjectProxy(obj, this._resolveMiddlewares(classDep.middlewares))
        }
        const {cache} = classDep
        classDep.hooks.onUpdate(cache.value, obj)
        cache.isRecalculate = false
        cache.value = obj

        return obj
    }

    resolveMeta(metaDep: MetaDep): IEntityMeta {
        const {sources, cache} = metaDep
        const newMeta: IEntityMeta = new EntityMeta();
        let isChanged: boolean = false;
        for (let i = 0, l = sources.length; i < l; i++) {
            if (updateMeta(newMeta, sources[i].meta)) {
                isChanged = true
            }
        }
        if (isChanged) {
            cache.value = newMeta
        }
        cache.isRecalculate = false
        return cache.value
    }

    resolveModel<T: Object>(modelDep: ModelDep<T>): T {
        const {cache} = modelDep
        cache.isRecalculate = false
        cache.value = modelDep.get()
        return cache.value
    }

    resolveSetter<T: Function, M>(setterDep: SetterDep<T, M>): T {
        const {info, cache} = setterDep
        const value = this.resolve(setterDep.facet)
        if (typeof value !== 'function') {
            throw new Error('Not a function returned from dep ' + info.displayName)
        }
        cache.isRecalculate = false
        cache.value = createFunctionProxy(value, [setterDep.set])
        return cache.value
    }
}
