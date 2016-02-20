/* @flow */
import type {Cacheable} from 'reactive-di/i/nodeInterfaces'
import type {EntityMeta} from 'reactive-di/i/plugins/asyncmodelInterfaces'
import type {ModelDep} from 'reactive-di/i/plugins/modelInterfaces'

interface AsyncModel<V, E> {
    meta: EntityMeta<E>;
    promise: Promise<any>;
    metaOwners: Array<Cacheable>;
    observer: Observer<V, E>;
    reset(): void;
}

// implements EntityMeta
class EntityMetaImpl<E> {
    pending: boolean;
    rejected: boolean;
    fulfilled: boolean;
    reason: ?E;

    constructor(
        pending: boolean,
        rejected: boolean,
        fulfilled: boolean,
        reason: ?E
    ) {
        this.pending = pending
        this.rejected = rejected
        this.fulfilled = fulfilled
        this.reason = reason
    }
}

function createPending(): EntityMeta {
    return new EntityMetaImpl(
        true,
        false,
        false,
        null
    )
}

function createSuccess(): EntityMeta {
    return new EntityMetaImpl(
        false,
        false,
        true,
        null
    )
}

function createError<E>(error: E): EntityMeta<E> {
    return new EntityMetaImpl(
        false,
        true,
        false,
        error
    )
}

export function update<E>(meta: EntityMeta<E>, src: EntityMeta<E>): boolean {
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

type ExposedPromise<V, E> = {
    success(value: V): void;
    error(error: E): void;
}

type PromiseHandlers<V, E> = {
    exposed: ExposedPromise<V, E>;
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

    const exposed: ExposedPromise = {
        success,
        error
    };

    return {promise, exposed}
}

type MetaSource<V, E> = {
    reset(): void;
    meta: EntityMeta<E>;
    exposed: ExposedPromise<V, E>;
}

// implements Observer<V, E>
class AsyncModelObserver<V: Object, E> {
    _subscription: Subscription;
    _model: ModelDep<V>;
    _metaSource: MetaSource<V, E>;
    _notify: () => void;

    constructor(
        observable: Observable<V, E>,
        model: ModelDep<V>,
        notify: () => void,
        metaSource: MetaSource<V, E>
    ) {
        this._model = model
        this._notify = notify
        this._subscription = observable.subscribe((this: Observer<V, E>))
        this._metaSource = metaSource
    }

    next(value: V): void {
        this._model.set(value)
        this._metaSource.exposed.success(value)
        this._notify()
    }

    error(err: E): void {
        const metaSource = this._metaSource
        metaSource.meta = createError(err)
        metaSource.exposed.error(err)
        metaSource.reset()
        this._notify()
        this.complete()
    }

    complete(): void {
        this._subscription.unsubscribe()
    }
}
// implements AsyncModel
export default class AsyncModelImpl<V: Object, E> {
    meta: EntityMeta<E>;
    promise: Promise<any>;
    metaOwners: Array<Cacheable>;
    observer: Observer<V, E>;

    exposed: ExposedPromise<V, E>;

    constructor(
        observable: Observable<V, E>,
        model: ModelDep<V>,
        notify: () => void
    ) {
        this.metaOwners = []
        this.meta = createPending()
        this._createPromise()
        this.observer = new AsyncModelObserver(observable, model, notify, (this: MetaSource<V, E>))
    }

    _createPromise(): void {
        const {promise, exposed} = createPromiseHandlers()
        this.promise = promise
        this.exposed = exposed
    }

    reset(): void {
        const {metaOwners} = this
        for (let i = 0, l = metaOwners.length; i < l; i++) {
            metaOwners[i].isRecalculate = true
        }
    }
}
