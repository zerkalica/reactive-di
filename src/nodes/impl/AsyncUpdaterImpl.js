/* @flow */

import type {
    AsyncUpdater,
    MetaSource,
    DepBase,
    EntityMeta,
    Cacheable
} from '../nodeInterfaces'
import type {Cursor, Notifier} from '../../modelInterfaces'
import merge from '../../utils/merge'

function setPending<E>(meta: EntityMeta<E>): EntityMeta<E> {
    return merge(meta, {
        pending: true,
        rejected: false,
        fulfilled: false,
        reason: null
    })
}

function setSuccess<E>(meta: EntityMeta<E>): EntityMeta<E> {
    return merge(meta, {
        pending: false,
        rejected: false,
        fulfilled: true,
        reason: null
    })
}

function setError<E>(meta: EntityMeta<E>, reason: E): EntityMeta<E> {
    return merge(meta, {
        pending: false,
        rejected: true,
        fulfilled: false,
        reason
    })
}

// implements AsyncUpdater
export default class AsyncUpdaterImpl<V: Object, E> {
    pending: () => void;
    success: (value: V) => void;
    error: (error: E) => void;

    constructor(
        cursor: Cursor<V>,
        notifier: Notifier,
        base: DepBase<V>,
        model: MetaSource<E>,
        dataOwners: Array<Cacheable>,
        metaOwners: Array<Cacheable>
    ) {
        function notifyDataChanges(): void {
            for (let i = 0, l = dataOwners.length; i < l; i++) {
                dataOwners[i].isRecalculate = true
            }
            notifier.notify()
        }

        function notifyMetaChanges(): void {
            for (let i = 0, l = metaOwners.length; i < l; i++) {
                metaOwners[i].isRecalculate = true
            }
            notifier.notify()
        }

        this.pending = function pending(): void {
            const newMeta: EntityMeta<E> = setPending(model.meta);
            if (model.meta === newMeta) {
                // if previous value is pending - do not handle this value: only first
                return
            }
            model.meta = newMeta
            notifyMetaChanges()
        }

        this.success = function success(value: V): void {
            if (cursor.set(value)) {
                base.value = value
                notifyDataChanges()
            }
            const newMeta: EntityMeta<E> = setSuccess(model.meta);
            if (newMeta !== model.meta) {
                model.meta = newMeta
                notifyMetaChanges()
            }
        }

        this.error = function error(reason: E): void {
            const newMeta: EntityMeta<E> = setError(model.meta, reason);
            if (newMeta !== model.meta) {
                model.meta = newMeta
                notifyMetaChanges()
            }
        }
    }
}
