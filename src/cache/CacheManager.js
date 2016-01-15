/* @flow */

import CacheRec from './CacheRec'
import type {DepId, Dependency} from '../interfaces'
import type {CacheRecMap} from './CacheRec'
import RawDepMeta from '../meta/RawDepMeta'
import AbstractMetaDriver from '../meta/drivers/AbstractMetaDriver'
import CacheUpdater from './CacheUpdater'
import createCacheRecStrategies from './createCacheRecStrategies'

type GetRawDepMeta<T> = (v: T) => RawDepMeta;

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
            this._updateCacheTraverse(dep, new CacheUpdater(cache))
            cacheRec = cache[rawDepMeta.id]
        }
        return cacheRec
    }

    _updateCacheTraverse(dep: Dependency, acc: CacheUpdater): void {
        const rawDepMeta = this._getRawDepMeta(dep)
        let id = rawDepMeta.id
        if (!id) {
            id = this._createId()
            rawDepMeta.id = id
        }

        if (!acc.isAffected(id)) {
            const cacheRec = createCacheRecStrategies[rawDepMeta.kind](rawDepMeta, dep)
            const {deps} = rawDepMeta
            if (Array.isArray(deps)) {
                acc.begin(cacheRec)
                for (let i = 0, j = deps.length; i < j; i++) {
                    this._updateCacheTraverse(deps[i], acc)
                }
            } else if (typeof deps === 'object') {
                const depNames = Object.keys(deps)
                cacheRec.depMeta.depNames = depNames
                acc.begin(cacheRec)
                for (let i = 0, j = depNames.length; i < j; i++) {
                    this._updateCacheTraverse(deps[depNames[i]], acc)
                }
            }
            acc.end(cacheRec)
        }
    }
}
