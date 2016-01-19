/* @flow */

import merge from '../../utils/merge'
import type {IEntityMeta} from '../nodeInterfaces'

export type EntityMetaRec = {
    pending?: boolean;
    rejected?: boolean;
    fulfilled?: boolean;
    needFetch?: boolean;
    reason?: ?Error;
}

// implements IEntityMeta
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

    _copy(rec: EntityMetaRec = {}): EntityMetaImpl {
        return merge(this, rec)
    }

    setNeedFetch(): EntityMetaImpl {
        return this._copy({
            needFetch: true
        })
    }

    setPending(): EntityMetaImpl {
        return this._copy({
            pending: true,
            rejected: false,
            fulfilled: false,
            needFetch: false,
            reason: null
        })
    }

    success(): EntityMetaImpl {
        return this._copy({
            pending: false,
            rejected: false,
            fulfilled: true,
            needFetch: false,
            reason: null
        })
    }

    error(reason: Error): EntityMetaImpl {
        return this._copy({
            pending: false,
            rejected: true,
            fulfilled: false,
            needFetch: false,
            reason
        })
    }
}

export function updateMeta(meta: IEntityMeta, src: IEntityMeta): boolean {
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
