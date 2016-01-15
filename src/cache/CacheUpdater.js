/* @flow */
import CacheRec from './CacheRec'
import type {DepId} from '../interfaces'
import type {CacheRecMap} from './CacheRec'

export default class CacheUpdater {
    // set of all dependencies per id
    _depSet: {[id: DepId]: Set<DepId>};
    // array of parents set of all dependencies
    _parents: Array<Set<DepId>>;

    _cache: CacheRecMap;

    constructor(cache: CacheRecMap) {
        this._cache = cache
        this._depSet = {}
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

    begin(cacheRec: CacheRec): CacheRec {
        const {_cache: cache, _parents: parents, _depSet: depSet} = this
        const {id} = cacheRec
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
