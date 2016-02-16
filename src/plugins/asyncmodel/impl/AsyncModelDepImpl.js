/* @flow */

import merge from 'reactive-di/utils/merge'
import EntityMetaImpl from 'reactive-di/plugins/asyncmodel/EntityMetaImpl'
import {DepBaseImpl} from 'reactive-di/core/pluginImpls'
import type {
    DepId,
    Info
} from 'reactive-di/i/annotationInterfaces'
import type {
    Cursor,
    FromJS
} from 'reactive-di/i/modelInterfaces'
import type {
    Cacheable,
    DepBase
} from 'reactive-di/i/nodeInterfaces'
import type {
    EntityMeta,
    AsyncModelDep // eslint-disable-line
} from 'reactive-di/plugins/asyncmodel/asyncmodelInterfaces'

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

type PromiseHandlers<V, E> = {
    success(value: V): void;
    error(error: E): void;
    promise: Promise<V>;
};

function noop() {}

function createPromiseHandlers<V, E>(): PromiseHandlers<V, E> {
    let success: (value: V) => void = noop;
    let error: (err: E) => void = noop;
    const promise = new Promise((resolve, reject) => {
        function onTimeout(): void {
            reject(new Error('Timeout error'))
        }
        const timerId: number = setTimeout(onTimeout, 10000);
        success = function successHandler(data: V): void {
            clearTimeout(timerId)
            resolve(data)
        }
        error = function errorHandler(err: E): void {
            clearTimeout(timerId)
            reject(err)
        }
    })

    return {promise, success, error}
}

// implements AsyncModelDep, Oserver
export default class AsyncModelDepImpl<V: Object, E> {
    kind: 'asyncmodel';
    base: DepBase;
    dataOwners: Array<Cacheable>;

    meta: EntityMeta<E>;
    metaOwners: Array<Cacheable>;
    promise: Promise<V>;

    _cursor: Cursor<V>;
    _fromJS: FromJS<V>;

    _value: V;

    _error: (error: E) => void;
    _success: (value: V) => void;

    constructor(
        id: DepId,
        info: Info,
        cursor: Cursor<V>,
        fromJS: FromJS<V>
    ) {
        this.kind = 'asyncmodel'

        this.base = new DepBaseImpl(id, info)
        this.base.relations.push(id)
        this._cursor = cursor
        this._fromJS = fromJS
        this._error = noop
        this._success = noop

        this.dataOwners = []
        this.metaOwners = []
        this.meta = new EntityMetaImpl({pending: true})
    }

    _notifyMeta(): void {
        const {metaOwners} = this
        for (let i = 0, l = metaOwners.length; i < l; i++) {
            metaOwners[i].isRecalculate = true
        }
    }

    _notifyData(): void {
        const {dataOwners} = this
        for (let i = 0, l = dataOwners.length; i < l; i++) {
            dataOwners[i].isRecalculate = true
        }
    }

    pending(): void {
        const newMeta: EntityMeta<E> = setPending(this.meta);
        if (this.meta === newMeta) {
            // if previous value is pending - do not handle this value: only first
            return
        }
        this.meta = newMeta
        this._updatePromise()
        this._notifyMeta()
    }

    reset(): void {
        this.pending()
        this._notifyData()
    }

    next(value: V): void {
        if (this._cursor.set(value)) {
            this._value = value
            this._notifyData()
        }
        const newMeta: EntityMeta<E> = setSuccess(this.meta);
        if (newMeta !== this.meta) {
            this.meta = newMeta
            this._notifyMeta()
        }
        this._success(value)
    }

    error(errorValue: E): void {
        const newMeta: EntityMeta<E> = setError(this.meta, errorValue);
        if (newMeta !== this.meta) {
            this.meta = newMeta
            this._notifyMeta()
        }
        this._error(errorValue)
    }

    _updatePromise(): void {
        const {promise, error, success} = createPromiseHandlers()
        this.promise = promise
        this._error = error
        this._success = success
    }

    setFromJS(data: Object): void {
        if (this._cursor.set(this._fromJS(data))) {
            this._notifyData()
        }
    }

    resolve(): V {
        const {base} = this
        if (!base.isRecalculate) {
            return this._value
        }
        base.isRecalculate = false
        this._value = this._cursor.get()

        return this._value
    }
}
