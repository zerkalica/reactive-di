/* @flow */

import merge from '../utils/merge'

type EntityMetaRec<T> = {
    pending?: boolean;
    rejected?: boolean;
    fulfilled?: boolean;
    reason?: ?Error;
    value?: T;
}

export default class EntityMeta<T> {
    pending: boolean;
    rejected: boolean;
    fulfilled: boolean;
    reason: ?Error;
    value: ?T;

    constructor(rec: EntityMetaRec<T> = {}) {
        this.pending = rec.pending || false
        this.rejected = rec.rejected || false
        this.fulfilled = rec.fulfilled === undefined ? true : rec.fulfilled
        this.reason = rec.reason || null
        this.value = rec.value
    }

    copy(rec: EntityMetaRec<T>): EntityMeta {
        return merge(this, rec)
    }

    static all<V>(owners: Array<EntityMeta<V>>): EntityMeta<Array<?V>> {
        const meta: EntityMetaRec<Array<?V>> = {
            pending: false,
            rejected: false,
            fulfilled: true,
            reason: null,
            value: []
        };
        const values: Array<?V> = [];
        for (let i = 0; i < owners.length; i++) {
            const {pending, rejected, fulfilled, reason, value} = owners[i]
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
            values.push(value)
        }
        meta.value = values

        return new EntityMeta(meta)
    }
}
