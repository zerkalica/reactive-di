/* @flow */

import merge from '../utils/merge'
import type {DepId} from '../interfaces'

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

    copy(rec: EntityMetaRec = {}): EntityMeta {
        return merge(this, rec)
    }
}

export type GetEntityMeta = (id: DepId) => EntityMeta;

export function updateMeta(meta: EntityMeta, src: EntityMeta): boolean {
    const {pending, rejected, fulfilled, reason} = src
    let isChanged = false
    if (!fulfilled) {
        isChanged = true
        meta.fulfilled = false
    }
    if (rejected) {
        isChanged = true
        meta.rejected = rejected
    }
    if (reason) {
        isChanged = true
        meta.reason = reason
    }
    if (pending) {
        isChanged = true
        meta.pending = pending
    }

    return isChanged
}
