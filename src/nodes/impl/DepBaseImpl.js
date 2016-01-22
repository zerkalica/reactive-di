/* @flow */

import EntityMetaImpl from './EntityMetaImpl'
import type {Info} from '../../annotations/annotationInterfaces'
import type {AnyDep, EntityMeta, DepBase} from '../nodeInterfaces'

// implements DepBase
export default class DepBaseImpl<V, E> {
    isRecalculate: boolean;
    value: V;
    info: Info;
    relations: Array<AnyDep>;
    meta: EntityMeta<E>;

    constructor(info: Info, isRecalculate: boolean = false) {
        this.info = info
        this.isRecalculate = isRecalculate
        this.relations = []
        this.meta = new EntityMetaImpl()
    }
}
