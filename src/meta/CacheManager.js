/* @flow */

import DepMeta from './DepMeta'
import type {DepId} from '../interfaces'
import CacheRec from '../CacheRec'
import type {CacheRecMap} from '../CacheRec'

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

    begin(cacheRec: CacheRec): void {
        const {_cache: cache, _parents: parents, _depSet: depSet} = this
        const {id} = cacheRec
        cache[id] = cacheRec
        const pathSet = depSet[id] = new Set()
        parents.push(pathSet)
    }

    end(cacheRec: CacheRec): void {
        const {_cache: cache, _parents: parents, _depSet: depSet} = this
        const {id, relations} = cacheRec

        function iteratePathSet(relationId) {
            let relationCacheRec = cache[relationId];
            if (!relationCacheRec) {
                relationCacheRec = new CacheRec(relationId)
                cache[relationId] = relationCacheRec
            }
            relationCacheRec.relations.push(cacheRec)
            relations.push(relationCacheRec)
        }

        depSet[id].forEach(iteratePathSet)

        parents.pop()
    }
}

function updateCacheTraverse(
    id: DepId,
    parentDeps: Array<DepMeta>,
    acc: CacheUpdater
): void {
    const cacheRec = new CacheRec(id)
    if (!acc.isAffected(id)) {
        acc.begin(cacheRec)
        for (let i = 0, j = parentDeps.length; i < j; i++) {
            const dep = parentDeps[i];
            updateCacheTraverse(dep.id, dep.deps, acc)
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

    get(id: DepId, deps: Array<DepMeta>): CacheRec {
        const {_cache: cache} = this
        let cacheRec = cache[id]
        if (!cacheRec) {
            updateCacheTraverse(id, deps, new CacheUpdater(cache))
            cacheRec = cache[id]
        }
        return cacheRec
    }
}
