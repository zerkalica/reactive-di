/* @flow */

import merge from '../utils/merge'

export type EntityMetaRec = {
    pending?: boolean;
    rejected?: boolean;
    fulfilled?: boolean;
    reason?: ?Error;
}

export default class EntityMeta {
    pending: boolean;
    rejected: boolean;
    fulfilled: boolean;
    reason: ?Error;

    constructor(rec: EntityMetaRec = {}) {
        this.pending = rec.pending || false
        this.rejected = rec.rejected || false
        this.fulfilled = rec.fulfilled === undefined ? true : rec.fulfilled
        this.reason = rec.reason || null
    }

    copy(rec: EntityMetaRec): EntityMeta {
        return merge(this, rec)
    }
}
