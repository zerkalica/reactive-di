/* @flow */

import CacheRec from './CacheRec'
import RawDepMeta from '../meta/RawDepMeta'
import EntityMeta from './EntityMeta'

type ICacheRecCreateStrategies<T> = {
    /* eslint-disable no-undef */
    klass: (raw: RawDepMeta, target: Class<T>) => CacheRec;
    model: (raw: RawDepMeta, target: Class<T>) => DepMeta;
}

function getMeta(cacheRec: CacheRec): EntityMeta {
    return cacheRec.meta
}

function getCachedValue(cacheRec: CacheRec): EntityMeta {
    return cacheRec.value
}

function getDataValue<T: Object>(cacheRec: CacheRec<T>): T {
    return cacheRec.getValue()
}

function pass<T>(value: T): T {
    return value
}

function proxifyResult<R: Function>(src: R, cacheRec: CacheRec): R {
    return createProxy(src, [cacheRec.setValue])
}

const createCacheRecStrategies: ICacheRecCreateStrategies = {
    /* eslint-disable */
    klass<T>({id, tags, hooks}: RawDepMeta, target: Class<T>): CacheRec {
        return new CacheRec({
            id,
            hooks,
            fn: createObject,
            tags
        })
    },

    factory({id, tags, hooks}: RawDepMeta, target: Function): CacheRec {
        return new CacheRec({
            id,
            hooks,
            fn: target,
            tags
        })
    },

    meta({id, tags}: RawDepMeta): CacheRec {
        return new CacheRec({
            id,
            fn: getMeta,
            tags
        })
    },

    model({id, tags, getDataValue}: RawDepMeta, target: Function): CacheRec {
        return new CacheRec({
            id,
            fn: cursor.getDataValue,
            tags
        })
    }
}

export default createCacheRecStrategies
