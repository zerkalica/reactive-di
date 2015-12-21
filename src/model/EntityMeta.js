/* @flow */

import merge from '../utils/merge'

export type EntityMetaRec = {
    loading?: ?boolean;
    invalid?: ?boolean;
    error?: ?Error;
}

export default class EntityMeta {
    loading: ?boolean;
    invalid: ?boolean;
    error: ?Error;

    constructor(rec: EntityMetaRec = {}) {
        this.error = rec.error || null

        const isError = Boolean(this.error)
        this.loading = rec.loading === undefined ? isError : rec.loading
        this.invalid = rec.invalid === undefined
            ? (isError || this.loading)
            : rec.invalid
    }

    copy(rec: EntityMetaRec): EntityMeta {
        return merge(this, rec)
    }

    static fromArray<T: Entity>(owners: Array<T>): EntityMeta {
        const meta = new EntityMeta();
        for (let i = 0; i < owners.length; i++) {
            const {loading, invalid, error} = owners[i].$meta
            if (invalid) {
                meta.invalid = invalid
            }
            if (error) {
                meta.error = error
            }
            if (loading) {
                meta.loading = loading
            }
        }

        return meta
    }
}

export type Entity = {
    id?: ?string;
    $meta: EntityMeta;
}
