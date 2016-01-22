/* @flow */

import type {EntityMeta} from '../nodeInterfaces'
import EntityMetaImpl from './EntityMetaImpl'

export default class CacheImpl<V, E> {
    value: V;
    isRecalculate: boolean;
    meta: EntityMeta<E>;

    constructor(isRecalculate?: boolean = false) {
        this.isRecalculate = isRecalculate
        this.meta = new EntityMetaImpl()
    }
}
