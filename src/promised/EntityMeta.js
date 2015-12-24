/* @flow */

export type EntityMetaRec = {
    pending?: boolean;
    rejected?: boolean;
    fulfilled?: boolean;
    reason?: ?Error;
}

function combineMeta(owners: Array<EntityMetaRec>): EntityMetaRec {
    const meta: EntityMetaRec = {
        pending: false,
        rejected: false,
        fulfilled: true,
        reason: null
    };
    for (let i = 0; i < owners.length; i++) {
        const {pending, rejected, fulfilled, reason} = owners[i]
        if (!fulfilled) {
            meta.fulfilled = false
        }
        if (rejected) {
            meta.rejected = rejected
        }
        if (reason) {
            meta.reason = reason
        }
        if (pending) {
            meta.pending = pending
        }
    }

    return meta
}

export default class EntityMeta {
    pending: boolean;
    rejected: boolean;
    fulfilled: boolean;
    reason: ?Error;

    constructor(r: EntityMetaRec|Array<EntityMetaRec> = {}) {
        const rec: EntityMetaRec = Array.isArray(r)
            ? combineMeta(r)
            : r
        this.pending = rec.pending || false
        this.rejected = rec.rejected || false
        this.fulfilled = rec.fulfilled === undefined ? true : rec.fulfilled
        this.reason = rec.reason || null
    }
}
