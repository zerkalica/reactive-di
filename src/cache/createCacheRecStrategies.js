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
        function createObject(...args: Array<any>): T {
            /* eslint-disable new-cap */
            switch (args.length) {
                case 0:
                    return new (target: any)
                case 1:
                    return new (target: any)(args[0])
                case 2:
                    return new (target: any)(args[0], args[1])
                case 3:
                    return new (target: any)(args[0], args[1], args[2])
                case 4:
                    return new (target: any)(args[0], args[1], args[2], args[3])
                case 5:
                    return new (target: any)(args[0], args[1], args[2], args[3], args[4])
                case 6:
                    return new (target: any)(args[0], args[1], args[2], args[3], args[4], args[5])
                default:
                    return new (target: any)(...args)
            }
            /* eslint-enable new-cap */
        }

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
