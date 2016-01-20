/* @flow */

import merge from '../../utils/merge'
import type {EntityMeta} from '../nodeInterfaces'

type EntityMetaRec = {
    pending?: boolean;
    rejected?: boolean;
    fulfilled?: boolean;
    needFetch?: boolean;
    reason?: ?Error;
}

// implements EntityMeta
export default class EntityMetaImpl {
    pending: boolean;
    rejected: boolean;
    fulfilled: boolean;
    needFetch: boolean;
    reason: ?Error;

    constructor(rec: EntityMetaRec = {}) {
        this.pending = rec.pending || false
        this.rejected = rec.rejected || false
        this.needFetch = rec.needFetch || false
        this.fulfilled = rec.fulfilled === undefined ? true : rec.fulfilled
        this.reason = rec.reason || null
    }
}

export function setNeedFetch(meta: EntityMeta): EntityMeta {
    return merge(meta, {
        needFetch: true
    })
}

export function setPending(meta: EntityMeta): EntityMeta {
    return merge(meta, {
        pending: true,
        rejected: false,
        fulfilled: false,
        needFetch: false,
        reason: null
    })
}

export function setSuccess(meta: EntityMeta): EntityMeta {
    return merge(meta, {
        pending: false,
        rejected: false,
        fulfilled: true,
        needFetch: false,
        reason: null
    })
}

export function setError(meta: EntityMeta, reason: Error): EntityMetaImpl {
    return merge(meta, {
        pending: false,
        rejected: true,
        fulfilled: false,
        needFetch: false,
        reason
    })
}


export function updateMeta(meta: EntityMeta, src: EntityMeta): boolean {
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
