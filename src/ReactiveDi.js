/* @flow */

import createProxy from './utils/createProxy'
import AbstractMetaDriver from './meta/drivers/AbstractMetaDriver'
import DepMeta from './meta/DepMeta'
import MetaLoader from './meta/MetaLoader'
import {AbstractSelector, selectorMeta} from './selectorInterfaces'
import type {Dependency, DepId} from './interfaces'
import ServiceSelector from './promised/ServiceSelector'

type CacheRec = {
    value: any;
    reCalculate: boolean;
}

type CacheMap = {[id: DepId]: CacheRec};

export default class ReactiveDi {
    _cache: CacheMap;
    _metaLoader: MetaLoader;
    _listeners: Array<Dependency>;
    _middlewares: {[id: DepId]: Array<DepMeta>};

    constructor(
        driver: AbstractMetaDriver,
        selector: AbstractSelector,
        registeredDeps?: Array<[Dependency, Dependency]>,
        middlewares?: Array<[Dependency|Array<string>, Array<Dependency>]>
    ) {
        this._cache = Object.create(null)
        const loader = this._metaLoader = new MetaLoader(
            driver,
            selector,
            ids => this._notify(ids),
            registeredDeps
        )
        this._listeners = []
        this._middlewares = Object.create(null);
        (middlewares || []).forEach(([frm, toDeps]) => {
            if (!Array.isArray(frm)) {
                this._middlewares[loader.get(frm).id] = toDeps.map(toDep => loader.get(toDep))
            }
        })
        this._cache[selectorMeta.id] = {
            value: new ServiceSelector(selector),
            reCalculate: false
        };
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
        this._listeners = this._listeners.filter(function _listenersFilter(d) {
            return dep !== d
        })
    }

    _get(
        depMeta: DepMeta,
        tempCache: CacheMap,
        debugCtx: Array<string>
    ): any {
        const {
            id,
            getter,
            displayName,
            deps,
            depNames,
            fn,
            onUpdate
        } = depMeta

        const cache = getter ? tempCache : this._cache
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
