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
}

export type PromiseHandlers<V, E> = {
    exposed: ExposedPromise<V, E>;
    promise: Promise<V>;
};

function noop() {}

export function createPromiseHandlers<V, E>(): PromiseHandlers<V, E> {
    const exposed: ExposedPromise = {
        success: noop,
        error: noop
    };

    function handler(resolve, reject): void {
        function onTimeout(): void {
            reject(new Error('Timeout error'))
        }
        const timerId: number = setTimeout(onTimeout, 10000);
        exposed.success = function successHandler(data: V): void {
            clearTimeout(timerId)
            resolve(data)
        }
        exposed.error = function errorHandler(err: E): void {
            clearTimeout(timerId)
            reject(err)
        }
    }

    return {
        promise: new Promise(handler),
        exposed
    }
}
