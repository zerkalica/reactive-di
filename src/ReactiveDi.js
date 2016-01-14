/* @flow */

import createProxy from './utils/createProxy'
import AbstractMetaDriver from './meta/drivers/AbstractMetaDriver'
import CacheManager from './cache/CacheManager'
import CacheRec from './cache/CacheRec'
import DepMeta from './meta/DepMeta'
import EntityMeta, {updateMeta} from './cache/EntityMeta'
import type {CacheRecMap} from './cache/CacheRec'
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
        this._listeners.push(dep)
        const depMeta = this._getMeta(dep)
        const cacheRec = this._get(depMeta, [])
        depMeta.hooks.onMount(cacheRec.value)
    }

    unmount<T>(dep: Dependency<T>): void {
        function _listenersFilter(d: Dependency): boolean {
            return dep !== d
        }
        const depMeta = this._getMeta(dep)
        const cacheRec = this._get(depMeta, [])
        depMeta.hooks.onUnmount(cacheRec.value)

        this._listeners = this._listeners.filter(_listenersFilter)
    }

    _get(depMeta: DepMeta, debugCtx: Array<string>): CacheRec {
        const {displayName} = depMeta
        const cacheRec = this._cache.get(depMeta)
        if (cacheRec.reCalculate) {
            debugCtx.push(displayName)
            const {id, deps, depNames, fn, hooks} = depMeta
            const defArgs = depNames ? [{}] : []
            const newMeta: EntityMeta = cacheRec.createMeta();
            let isChanged = false
            for (let i = 0, j = deps.length; i < j; i++) {
                const dep = deps[i]
                const depRec = this._get(dep, debugCtx)
                const value = dep.isCacheRec ? depRec : depRec.value
                if (depNames) {
                    defArgs[0][depNames[i]] = value
                } else {
                    defArgs.push(value)
                }
                if (updateMeta(newMeta, depRec.meta)) {
                    isChanged = true
                }
            }
            let result
            try {
                result = fn(...defArgs)
                hooks.onUpdate(cacheRec.value, result)
            } catch (e) {
                e.message = e.message + ', @path: ' + debugCtx.join('.')
                throw e
            }
            cacheRec.reCalculate = false
            cacheRec.value = this._proxify(result, id)
            if (isChanged) {
                cacheRec.meta = newMeta
            }
            debugCtx.pop()
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
