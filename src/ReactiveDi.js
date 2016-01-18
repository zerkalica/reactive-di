/* @flow */

import {createObjectProxy, createFunctionProxy} from './utils/createProxy'
import CacheManager from './cache/CacheManager'
import CacheRec from './cache/CacheRec'
import EntityMeta, {updateMeta} from './cache/EntityMeta'
import type {CacheRecMap} from './cache/CacheRec'
import type {Dependency, DepId} from './interfaces'
import DepProcessor from './DepProcessor'

type MiddlewareMap = {[id: DepId]: Array<CacheRec>};

function normalizeMiddlewares(
    rawMiddlewares: Array<[Dependency, Array<Dependency>]>,
    getDepMeta: (dep: Dependency) => CacheRec
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

    _cachedMeta: {[id: DepId]: CacheRec};

    _debugCtx: Array<string>;
    _depProcessor: DepProcessor;

    constructor(
        driver: AbstractMetaDriver,
        cache: CacheRecMap,
        aliases?: Array<[Dependency, Dependency]>,
        middlewares?: Array<[Dependency, Array<Dependency>]>
    ) {
        this._listeners = []
        this._cache = new CacheManager(cache, driver)
        this._cachedMeta = Object.create(null)

        ;(aliases || []).forEach(([depSrc, depTarget]) => {
            this._cachedMeta[driver.get(depSrc).id] = driver.get(depTarget)
        })

        this._middlewares = normalizeMiddlewares(
            middlewares || [],
            dep => this._getMeta(dep)
        )
        this._debugCtx = []
        this._depProcessor = new DepProcessor()
    }

    _getMeta(dep: Dependency): CacheRec {
        const {depMeta} = this._cache.get(dep)
        return this._cachedMeta[depMeta.id] || depMeta
    }

    mount<T>(dep: Dependency<T>): void {
        this._listeners.push(dep)
        this._cache.get(dep).onMount()
    }

    unmount<T>(dep: Dependency<T>): void {
        this._cache.get(dep).onUnmount()
        function _listenersFilter(d: Dependency): boolean {
            return dep !== d
        }
        this._listeners = this._listeners.filter(_listenersFilter)
    }

    get(dep: Dependency): any {
        return this._depProcessor.resolve(this._cache.get(dep))
    }
}
