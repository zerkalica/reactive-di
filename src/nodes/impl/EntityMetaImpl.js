/* @flow */

import merge from '../../utils/merge'
import type {EntityMeta} from '../nodeInterfaces'

type EntityMetaRec = {
    pending?: boolean;
    rejected?: boolean;
    fulfilled?: boolean;
    reason?: ?Error;
}

// implements EntityMeta
export default class EntityMetaImpl {
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
}

export function setPending(meta: EntityMeta): EntityMeta {
    return merge(meta, {
        pending: true,
        rejected: false,
        fulfilled: false,
        reason: null
    })
}

export function setSuccess(meta: EntityMeta): EntityMeta {
    return merge(meta, {
        pending: false,
        rejected: false,
        fulfilled: true,
        reason: null
    })
}

export function setError(meta: EntityMeta, reason: Error): EntityMetaImpl {
    return merge(meta, {
        pending: false,
        rejected: true,
        fulfilled: false,
        reason
    })
}

function updateMeta(meta: EntityMeta, src: EntityMeta): boolean {
    const {pending, rejected, fulfilled, reason} = src
    let isChanged = false
    /* eslint-disable no-param-reassign */
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
    /* eslint-enable no-param-reassign */

    return isChanged
}

type MetaContainer = {
    meta: EntityMeta;
}

export function recalcMeta(initialMeta: EntityMeta, sources: Array<MetaContainer>, originMeta?: EntityMeta): EntityMeta {
    const newMeta: EntityMeta = new EntityMetaImpl();
    for (let i = 0, l = sources.length; i < l; i++) {
        updateMeta(newMeta, sources[i].meta)
    }
    if (originMeta) {
        updateMeta(newMeta, originMeta)
    }

    return merge(initialMeta, newMeta)
}
