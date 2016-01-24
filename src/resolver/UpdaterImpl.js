/* @flow */

import type {
    Updater,
    Notifier
} from './resolverInterfaces'
import type {
    EntityMeta,
    Cacheable,
    ModelDep,
    AsyncModelDep
} from '../nodes/nodeInterfaces'
import type {Cursor} from '../modelInterfaces'
import merge from '../utils/merge'

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

// implements Updater
export default class UpdaterImpl<V: Object, E> {
    pending: () => void;
    success: (value: V) => void;
    error: (error: E) => void;

    constructor(model: AsyncModelDep<V, E>, notifier: Notifier) {
        const {
            cursor,
            base
        } = model
        const {dataRels, metaRels} = base.relations
        function notifyDataChanges(): void {
            for (let i = 0, l = dataRels.length; i < l; i++) {
                dataRels[i].isRecalculate = true
            }
            notifier.notify()
        }

        function notifyMetaChanges(): void {
            for (let i = 0, l = metaRels.length; i < l; i++) {
                metaRels[i].isRecalculate = true
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
