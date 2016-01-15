/* @flow */

import CacheRec from './CacheRec'
import type {DepId, Dependency} from '../interfaces'
import type {CacheRecMap} from './CacheRec'
import RawDepMeta from '../meta/RawDepMeta'
import AbstractMetaDriver from '../meta/drivers/AbstractMetaDriver'
import CacheUpdater from './CacheUpdater'

type GetRawDepMeta<T> = (v: T) => RawDepMeta;

function createCacheRecFromDep({
    id,
    deps,
    tags,
    kind,
    setters,
    hooks
}: RawDepMeta): CacheRec {
    return new CacheRec({
        id,
    })
}

export default class CacheManager {
    _cache: CacheRecMap;
    _driver: AbstractMetaDriver;
    _getRawDepMeta: GetRawDepMeta;
    _createId: () => DepId;

    constructor(cache: CacheRecMap, getRawDepMeta: GetRawDepMeta) {
        this._cache = cache
        this._getRawDepMeta = getRawDepMeta
    }

    getRec<T: Object>(dep: Dependency): CacheRec<T> {
        const {_cache: cache} = this
        const rawDepMeta = this._getRawDepMeta(dep)
        let cacheRec = cache[rawDepMeta.id]
        if (!cacheRec) {
            this._updateCacheTraverse(rawDepMeta, new CacheUpdater(cache))
            cacheRec = cache[rawDepMeta.id]
        }
        return cacheRec
    }

    _updateCacheTraverse(dep: RawDepMeta, acc: CacheUpdater): void {
        let id = dep.id
        if (!id) {
            id = this._createId()
            dep.id = id
        }

        if (!acc.isAffected(id)) {
            const cacheRec = createCacheRecFromDep(dep)
            acc.begin(cacheRec)
            const deps = dep.deps
            let depNames = null
            if (Array.isArray(deps)) {
                for (let i = 0, j = deps.length; i < j; i++) {
                    this._updateCacheTraverse(this._getRawDepMeta(deps[i]), acc)
                }
            } else if (typeof deps === 'object') {
                depNames = Object.keys(deps)
                for (let i = 0, j = depNames.length; i < j; i++) {
                    const depName = depNames[i]
                    this._updateCacheTraverse(this._getRawDepMeta(deps[depName]), acc)
                }
            }
            acc.end(cacheRec)
            cacheRec.depMeta.depNames = depNames
        }
    }
}
