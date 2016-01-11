/* @flow */

import createProxy from './utils/createProxy'
import AbstractMetaDriver from './meta/drivers/AbstractMetaDriver'
import DepMeta from './meta/DepMeta'
import MetaLoader from './meta/MetaLoader'
import PromiseSelector from './promised/PromisedSelector'
import {AbstractSelector, promisedSelectorMeta, selectorMeta} from './selectorInterfaces'
import type {Dependency, DepId} from './interfaces'

type CacheRec = {
    value: any;
    reCalculate: boolean;
}

type CacheMap = {[id: DepId]: CacheRec};

type MiddlewareMap = {[id: DepId]: Array<DepMeta>};

function normalizeMiddlewares(
    rawMiddlewares: Array<[Dependency, Array<Dependency>]>,
    getDepMeta: (dep: Dependency) => DepMeta
): MiddlewareMap {
    const middlewares: MiddlewareMap = {};
    for (let i = 0, l = rawMiddlewares.length; i < l; i++) {
        const [frm, toDeps] = rawMiddlewares[i]
        const key = getDepMeta(frm).id
        let group = middlewares[key]
        if (!group) {
            group = []
            middlewares[key] = group
        }
        for (let j = 0, k = toDeps.length; j < k; j++) {
            group.push(getDepMeta(toDeps[j]))
        }
    }

    return middlewares
}

export default class ReactiveDi {
    _cache: CacheMap;
    _metaLoader: MetaLoader;
    _listeners: Array<Dependency>;
    _middlewares: MiddlewareMap;

    constructor(
        driver: AbstractMetaDriver,
        selector: AbstractSelector,
        aliases?: Array<[Dependency, Dependency]>,
        middlewares?: Array<[Dependency, Array<Dependency>]>
    ) {
        this._listeners = []
        this._cache = Object.create(null)

        this._metaLoader = new MetaLoader(
            driver,
            selector,
            ids => this._notify(ids),
            aliases
        )
        this._middlewares = normalizeMiddlewares(
            middlewares || [],
            dep => this._metaLoader.get(dep)
        )
        this._cache[selectorMeta.id] = {
            value: this._metaLoader.selector,
            reCalculate: false
        };
        this._cache[promisedSelectorMeta.id] = {
            value: this._metaLoader.promiseSelector,
            reCalculate: false
        }
    }

    _notify(ids: Array<DepId>): void {
        const cache = this._cache
        for (let i = 0, k = ids.length; i < k; i++) {
            if (cache[ids[i]]) {
                cache[ids[i]].reCalculate = true
            }
        }
    }

    mount<T>(dep: Dependency<T>): void {
        const {id, deps} = this._metaLoader.get(dep)
        this._metaLoader.update(id, deps)
        this._cache[id] = {
            value: null,
            // do not call listener on first state change
            reCalculate: false
        }
        this._listeners.push(dep)
    }

    unmount<T>(dep: Dependency<T>): void {
        const {id} = this._metaLoader.get(dep)
        // do not call listener on first state change
        const cache = this._cache[id] || {}
        cache.value = null
        cache.reCalculate = false

        function _listenersFilter(d) {
            return dep !== d
        }

        this._listeners = this._listeners.filter(_listenersFilter)
    }

    _get(
        depMeta: DepMeta,
        tempCache: CacheMap,
        debugCtx: Array<string>
    ): any {
        const {
            id,
            isState,
            displayName,
            deps,
            depNames,
            fn,
            onUpdate
        } = depMeta

        const cache = isState ? tempCache : this._cache
        let cacheRec = cache[id]
        if (!cacheRec) {
            cacheRec = {
                value: null,
                reCalculate: true
            }
            cache[id] = cacheRec
        }

        if (cacheRec.reCalculate) {
            this._metaLoader.update(id, deps)
            const defArgs = depNames ? [{}] : []
            for (let i = 0, j = deps.length; i < j; i++) {
                const dep = deps[i]
                const value = this._get(
                    dep,
                    tempCache,
                    debugCtx.concat([displayName, '' + i])
                )
                if (depNames) {
                    defArgs[0][depNames[i]] = value
                } else {
                    defArgs.push(value)
                }
            }
            let result
            try {
                result = fn(...defArgs)
                onUpdate(cacheRec.value, result)
            } catch (e) {
                e.message = e.message + ', @path: '
                    + debugCtx.concat([displayName]).join('.')
                throw e
            }
            cacheRec.reCalculate = false
            cacheRec.value = this._proxify(result, id)
        }

        return cacheRec.value
    }

    _proxify<T: Function>(result: T, id: DepId): T {
        const middlewares = this._middlewares[id]
        if (!middlewares) {
            return result
        }
        const resolvedMdls = []
        const tmpCache = {}
        const debugCtx = []
        for (let i = 0, j = middlewares.length; i < j; i++) {
            resolvedMdls.push(this._get(middlewares[i], tmpCache, debugCtx))
        }

        return createProxy(result, resolvedMdls)
    }

    get<T>(dep: Dependency<T>): T {
        return this._get(this._metaLoader.get(dep), {}, [])
    }
}
