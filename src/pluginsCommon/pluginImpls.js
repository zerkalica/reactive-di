/* @flow */

import getFunctionName from 'reactive-di/utils/getFunctionName'
import type {
    DepId,
    Info,
    Tag
} from 'reactive-di/i/annotationInterfaces'
import type {EntityMeta} from 'reactive-di/i/nodeInterfaces' // eslint-disable-line

// implements DepBase
export class DepBaseImpl<V> {
    isRecalculate: boolean;
    value: V;
    relations: Array<DepId>;
    id: DepId;
    info: Info;

    constructor(
        id: DepId,
        info: Info,
        value?: V
    ) {
        this.id = id
        this.info = info
        this.isRecalculate = value === undefined
        this.relations = []
        if (value !== undefined) {
            this.value = value
        }
    }
}

// implements Info
class InfoImpl {
    tags: Array<Tag>;
    displayName: string;

    constructor(
        kind: string,
        name: string,
        tags: Array<Tag>
    ) {
        this.displayName = kind + '@' + name
        this.tags = tags.concat([kind, name])
    }
}

// implements AnnotationBase
export class AnnotationBaseImpl<T: Function> {
    id: DepId;
    info: Info;
    target: T;

    constructor(
        id: DepId,
        kind: string,
        tags: Array<string>,
        target: T
    ) {
        const name: string = getFunctionName(target);
        this.id = id
        this.info = new InfoImpl(kind, name, tags)
        this.target = target
    }
}


// implements EntityMeta
export class EntityMetaImpl<E> {
    pending: boolean;
    rejected: boolean;
    fulfilled: boolean;
    reason: ?E;

    constructor(rec: {
        pending?: boolean,
        rejected?: boolean,
        fulfilled?: boolean,
        reason?: ?E
    } = {}) {
        this.pending = rec.pending || false
        this.rejected = rec.rejected || false
        this.fulfilled = rec.fulfilled || false
        this.reason = rec.reason || null
    }
}
