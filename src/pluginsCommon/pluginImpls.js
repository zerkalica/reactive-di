/* @flow */

import type {
    DepId,
    Tag
} from 'reactive-di/i/annotationInterfaces'
import type {EntityMeta} from 'reactive-di/i/nodeInterfaces' // eslint-disable-line
import getFunctionName from 'reactive-di/utils/getFunctionName'

// implements DepBase
export class DepBaseImpl {
    isRecalculate: boolean;
    relations: Array<DepId>;

    id: DepId;
    displayName: string;
    tags: Array<Tag>;

    constructor(
        annotation: {
            kind: string,
            id: DepId,
            target: Function
        },
        isRecalculate: boolean = false
    ) {
        this.id = annotation.id
        this.displayName = annotation.kind + '@' + getFunctionName(annotation.target)
        this.tags = [annotation.kind]
        this.isRecalculate = isRecalculate
        this.relations = []
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
