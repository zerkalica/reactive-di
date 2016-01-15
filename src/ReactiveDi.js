/* @flow */

import createProxy from './utils/createProxy'
import CacheManager from './cache/CacheManager'
import CacheRec from './cache/CacheRec'
import EntityMeta, {updateMeta} from './cache/EntityMeta'
import type {CacheRecMap} from './cache/CacheRec'
import type {Dependency, DepId} from './interfaces'

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

    _get(cacheRec: CacheRec, debugCtx: Array<string>): CacheRec {
        if (cacheRec.reCalculate) {
            const {id, displayName, depNames, fn, fromCacheRec} = cacheRec
            const deps = cacheRec.deps
            debugCtx.push(displayName)
            const defArgs = depNames ? [{}] : []
            const newMeta: EntityMeta = cacheRec.getOriginMeta();
            let isChanged = false
            for (let i = 0, j = deps.length; i < j; i++) {
                const depRec = this._get(deps[i], debugCtx)
                const value = depRec.kind === 'meta' ? depRec.meta : depRec.value
                if (depNames) {
                    defArgs[0][depNames[i]] = value
                } else {
                    defArgs.push(value)
                }
                if (updateMeta(newMeta, depRec.meta)) {
                    isChanged = true
                }
            }
            if (isChanged) {
                cacheRec.meta = newMeta
            }

            let result
            try {
                switch (kind) {
                case 'model':
                    result = cacheRec.getValue()
                    break
                case 'meta':
                    result = defArgs[0].meta
                    break
                case 'factory':
                    result = this._proxify(fn(...defArgs), id)
                    break
                case 'klass':
                    result = this._proxify(fn(...defArgs), id)
                    break
                case 'setter':
                    result = defArgs[0].setValue
                    break
                default:
                    throw new Error('Unknown kind: ' + kind)
                }
                cacheRec.setValue(result)
            } catch (e) {
                e.message = e.message + ', @path: ' + debugCtx.join('.')
                throw e
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
            resolvedMdls.push(this._get(middlewares[i], debugCtx).value)
        }

        return createProxy(result, resolvedMdls)
    }

    get(dep: Dependency): any {
        return this._get(this._cache.get(dep), []).value
    }
}
