/* @flow */
import merge from 'reactive-di/utils/merge'
import type {EntityMeta} from 'reactive-di/i/nodeInterfaces'

export function setPending<E>(meta: EntityMeta<E>): EntityMeta<E> {
    return merge(meta, {
        pending: true,
        rejected: false,
        fulfilled: false,
        reason: null
    })
}

export function setSuccess<E>(meta: EntityMeta<E>): EntityMeta<E> {
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

export type ExposedPromise<V, E> = {
    success(value: V): void;
    error(error: E): void;
    cancel(): void;
}

export type PromiseHandlers<V, E> = {
    exposed: ExposedPromise<V, E>;
    promise: Promise<V>;
};

function noop() {}

export function createPromiseHandlers<V, E>(): PromiseHandlers<V, E> {
    const exposed: ExposedPromise = {
        success: noop,
        error: noop,
        cancel: noop
    };

    function handler(resolve, reject): void {
        let isCanceled = false;
        exposed.cancel = function cancel(): void {
            isCanceled = true
        }

        exposed.success = function successHandler(data: V): void {
            if (!isCanceled) {
                resolve(data)
            }
        }
        exposed.error = function errorHandler(err: E): void {
            if (!isCanceled) {
                reject(err)
            }
        }
    }

    return {
        promise: new Promise(handler),
        exposed
    }
}
