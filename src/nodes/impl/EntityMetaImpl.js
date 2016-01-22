/* @flow */

import merge from '../../utils/merge'
import type {EntityMeta} from '../nodeInterfaces'

type EntityMetaRec<E> = {
    pending?: boolean;
    rejected?: boolean;
    fulfilled?: boolean;
    reason?: ?E;
}

// implements EntityMeta
export default class EntityMetaImpl<E> {
    pending: boolean;
    rejected: boolean;
    fulfilled: boolean;
    reason: ?E;

    constructor(rec: EntityMetaRec<E> = {}) {
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

export function setError<E>(meta: EntityMeta<E>, reason: E): EntityMeta<E> {
    return merge(meta, {
        pending: false,
        rejected: true,
        fulfilled: false,
        reason
    })
}

export function updateMeta<E>(meta: EntityMeta<E>, src: EntityMeta<E>): boolean {
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
