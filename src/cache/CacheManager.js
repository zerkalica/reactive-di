/* @flow */

import CacheRec from './CacheRec'
import type {DepId, BaseDep} from '../interfaces'
import type {CacheRecMap} from './CacheRec'

class CacheUpdater {
    // set of all dependencies per id
    _depSet: {[id: DepId]: Set<DepId>};
    // array of parents set of all dependencies
    _parents: Array<Set<DepId>>;

    _cache: CacheRecMap;

    constructor(cache: CacheRecMap) {
        this._cache = cache
        this._depSet = Object.create(null)
        this._parents = []
    }

    isAffected(id: DepId): boolean {
        const {_cache: cache, _parents: parents} = this
        const cacheRec = cache[id]
        if (cacheRec) {
            const {relations} = cacheRec
            for (let i = 0, l = relations.length; i < l; i++) {
                const {id: relationId} = relations[i]
                for (let j = 0, k = parents.length; j < k; j++) {
                    parents[j].add(relationId)
                }
            }
            return true
        }
        return false
    }

    begin(id: DepId): CacheRec {
        const {_cache: cache, _parents: parents, _depSet: depSet} = this
        const cacheRec = new CacheRec(id)
        cache[id] = cacheRec
        const pathSet = depSet[id] = new Set()
        parents.push(pathSet)

        return cacheRec
    }

    end(cacheRec: CacheRec): void {
        const {_cache: cache, _parents: parents, _depSet: depSet} = this
        function iteratePathSet(relationId) {
            const relationCacheRec = cache[relationId]
            relationCacheRec.relations.push(cacheRec)
        }

        depSet[cacheRec.id].forEach(iteratePathSet)

        parents.pop()
    }
}

function updateCacheTraverse(dep: BaseDep, acc: CacheUpdater): void {
    const {id, deps} = dep
    if (!acc.isAffected(id)) {
        const cacheRec = acc.begin(id)
        for (let i = 0, j = deps.length; i < j; i++) {
            updateCacheTraverse(deps[i], acc)
        }
        acc.end(cacheRec)
    }
}

export default class CacheManager {
    _cache: CacheRecMap;

    constructor(cache: CacheRecMap) {
        this._cache = cache
    }

    reset(id: DepId): void {
        const cacheRec = this._cache[id]
        if (cacheRec) {
            cacheRec.reset()
        }
    }

    get<T>(dep: BaseDep<T>): CacheRec {
        const {_cache: cache} = this
        let cacheRec = cache[dep.id]
        if (!cacheRec) {
            updateCacheTraverse(dep, new CacheUpdater(cache))
            cacheRec = cache[dep.id]
        }
        return cacheRec
    }
}
