/* @flow */

import type {NotifyFn} from '../interfaces'

export type EntityMetaRec = {
    loading?: ?boolean;
    invalid?: ?boolean;
    deleted?: ?boolean;
    error?: ?Error;
    notify?: ?NotifyFn;
}

export default class EntityMeta {
    loading: ?boolean;
    invalid: ?boolean;
    deleted: ?boolean;
    error: ?Error;
    notify: ?NotifyFn;

    constructor(rec: EntityMetaRec = {}) {
        this.error = rec.error || null

        const isError = Boolean(this.error)
        this.deleted = rec.deleted || false
        this.loading = rec.loading === undefined ? isError : rec.loading
        this.invalid = rec.invalid === undefined
            ? (isError || this.loading || this.deleted)
            : rec.invalid
        this.notify = rec.notify
    }

    copy(rec: EntityMetaRec = {}): EntityMeta {
        return new EntityMeta({...this, ...rec})
    }

    static get(obj: Object): ?EntityMeta {
        return obj.$meta
    }

    static fromArray<T: Entity>(owners: Array<T>): EntityMeta {
        const meta = new EntityMeta();
        for (let i = 0; i < owners.length; i++) {
            const {notify, loading, invalid, error, deleted} = owners[i].$meta
            if (notify) {
                meta.notify = notify
            }
            if (deleted) {
                meta.deleted = deleted
            }
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
export function create<R: Object, T: Object>(
    rec?: ?R,
    /* eslint-disable no-undef */
    Entity: Class<T>
    /* eslint-enable no-undef */
): T {
    return rec instanceof Entity
        ? rec
        : new Entity(rec)
}

export function copyProps<C: Entity, R: Object>(obj: C, rec: R): R {
    const $meta = rec.$meta instanceof EntityMeta
        ? rec.$meta
        : obj.$meta.copy(rec.$meta)

    return {...obj, ...rec, $meta}
}

export type Entity = {
    id?: ?string;
    $meta: EntityMeta;
}
