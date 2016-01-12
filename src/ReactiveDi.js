/* @flow */

import createProxy from './utils/createProxy'
import AbstractMetaDriver from './meta/drivers/AbstractMetaDriver'
import CacheManager from './meta/CacheManager'
import CacheRec from './CacheRec'
import DepMeta from './meta/DepMeta'
import EntityMeta, {updateMeta} from './meta/EntityMeta'
import type {CacheRecMap} from './CacheRec'
import type {Dependency, DepId} from './interfaces'

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
    _listeners: Array<Dependency>;
    _middlewares: MiddlewareMap;
    _cache: CacheManager;

    _driver: AbstractMetaDriver;
    _cachedMeta: {[id: DepId]: DepMeta};

    constructor(
        driver: AbstractMetaDriver,
        cache: CacheRecMap,
        aliases?: Array<[Dependency, Dependency]>,
        middlewares?: Array<[Dependency, Array<Dependency>]>
    ) {
        this._listeners = []
        this._cache = new CacheManager(cache)
        this._driver = driver
        this._cachedMeta = Object.create(null)

        ;(aliases || []).forEach(([depSrc, depTarget]) => {
            this._cachedMeta[driver.get(depSrc).id] = driver.get(depTarget)
        })

        this._middlewares = normalizeMiddlewares(
            middlewares || [],
            dep => this._getMeta(dep)
        )
    }

    _getMeta(dep: Dependency): DepMeta {
        const depMeta = this._driver.get(dep)
        return this._cachedMeta[depMeta.id] || depMeta
    }

    mount<T>(dep: Dependency<T>): void {
        const {_cache, _listeners} = this
        const {id} = this._getMeta(dep)
        // do not call listener on first state change
        _cache.reset(id)
        _listeners.push(dep)
    }

    unmount<T>(dep: Dependency<T>): void {
        const {_cache, _listeners} = this
        const {id} = this._getMeta(dep)
        // do not call listener on first state change
        _cache.reset(id)

        function _listenersFilter(d) {
            return dep !== d
        }

        this._listeners = _listeners.filter(_listenersFilter)
    }

    _get(depMeta: DepMeta, debugCtx: Array<string>): CacheRec {
        const {
            id,
            displayName,
            deps,
            depNames,
            fn,
            onUpdate
        } = depMeta

        const cacheRec = this._cache.get(id, deps)

        if (cacheRec.reCalculate) {
            const defArgs = depNames ? [{}] : []
            const newMeta: EntityMeta = cacheRec.createMeta();
            let isChanged = false
            for (let i = 0, j = deps.length; i < j; i++) {
                const dep = deps[i]
                const depRec = this._get(
                    dep,
                    debugCtx.concat([displayName, '' + i])
                )
                if (depNames) {
                    defArgs[0][depNames[i]] = dep.fromCacheRec(depRec)
                } else {
                    defArgs.push(dep.fromCacheRec(depRec))
                }
                if (updateMeta(newMeta, depRec.meta)) {
                    isChanged = true
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
            if (isChanged) {
                cacheRec.meta = newMeta
            }
        }

        return cacheRec
    }

    _proxify<T: Function>(result: T, id: DepId): T {
        const middlewares = this._middlewares[id]
        if (!middlewares) {
            return result
        }
        const resolvedMdls = []
        const debugCtx = []
        for (let i = 0, j = middlewares.length; i < j; i++) {
            resolvedMdls.push(this._get(middlewares[i], debugCtx))
        }

        return createProxy(result, resolvedMdls)
    }

    get(dep: Dependency): any {
        return this._get(this._getMeta(dep), []).value
    }
}
