/* @flow */

import type {EntityMeta} from '../nodeInterfaces'
import EntityMetaImpl from './EntityMetaImpl'

export default class CacheImpl<T> {
    value: T;
    isRecalculate: boolean;
    meta: EntityMeta;

    constructor(isRecalculate?: boolean = false) {
        this.isRecalculate = isRecalculate
        this.meta = new EntityMetaImpl()
    }
}
