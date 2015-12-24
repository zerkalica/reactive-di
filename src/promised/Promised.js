/* @flow */

import merge from '../utils/merge'
import EntityMeta from './EntityMeta'
import type {EntityMetaRec} from './EntityMeta'

type PromisedRec<T> = EntityMetaRec & {
    value: T;
}

export default class Promised<T> extends EntityMeta {
    value: T;

    constructor(rec: PromisedRec<T>) {
        super(rec)
        this.value = rec.value
    }

    static all<V>(owners: Array<Promised<V>>): Promised<Array<?V>> {
        const meta: PromisedRec<Array<?V>> = {
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

        return new Promised(meta)
    }

    copy(rec: PromisedRec<T>): Promised<T> {
        return merge(this, rec)
    }
}
