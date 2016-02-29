/* @flow */

import promiseToObservable from 'reactive-di/utils/promiseToObservable'
import {
    createPromiseHandlers,
    setPending,
    setError,
    setSuccess
} from 'reactive-di/plugins/setter/impl/asyncHelpers'
import {
    EntityMetaImpl,
    DepBaseImpl
} from 'reactive-di/pluginsCommon/pluginImpls'
import type {
    EntityMeta,
    DepBase,
    Cacheable,
    Invoker
} from 'reactive-di/i/nodeInterfaces'
import type {ModelDep} from 'reactive-di/i/plugins/modelInterfaces'
import type {
    AsyncSetterDep, // eslint-disable-line
    SetFn,
    PromiseSource,
    AsyncResult
} from 'reactive-di/i/plugins/setterInterfaces'
import type {ExposedPromise} from 'reactive-di/plugins/setter/impl/asyncHelpers'
import type {AsyncSetterAnnotation} from 'reactive-di/i/plugins/setterInterfaces'

const defaultSubscription: Subscription = {
    unsubscribe() {}
};

class RollbackObserver<V: Object, E> {
    _observer: Observer<?V, E>;
    _model: ModelDep<V>;
    _oldValue: V;

    constructor(
        observer: Observer<?V, E>,
        model: ModelDep<V>,
        oldValue: V
    ) {
        this._observer = observer
        this._model = model

        this._oldValue = oldValue
    }

    next(value: ?V): void {
        this._observer.next(value)
    }

    error(err: E): void {
        this._model.set(this._oldValue)
        this._observer.error(err)
    }

    complete(): void {
        this._observer.complete()
    }
}

// implements AsyncSetterDep
export default class AsyncSetterDepImpl<V: Object, E> {
    kind: 'asyncsetter';
    base: DepBase;

    meta: EntityMeta<E>;
    promise: Promise<void>;
    metaOwners: Array<Cacheable>;
    childSetters: Array<PromiseSource>;

    _notify: () => void;
    _invoker: Invoker<AsyncResult<V, E>>;
    _value: SetFn;
    _model: ModelDep<V>;
    _subscription: Subscription;

    _exposed: ?ExposedPromise<void, E>;

    constructor(
        annotation: AsyncSetterAnnotation<V, E>,
        notify: () => void,
        model: ModelDep<V>
    ) {
        this.kind = 'asyncsetter'
        this.base = new DepBaseImpl(annotation)
        this.metaOwners = []
        this.meta = new EntityMetaImpl({fulfilled: true})
        const childSetters: Array<PromiseSource> = this.childSetters = [];

        this._notify = notify
        this._model = model
        this._subscription = defaultSubscription
        this._createPromise()

        const self = this

        this._value = function setValue(...args: Array<any>): void {
            function success(): void {
                self._setterResolver(args)
            }
            const promises: Array<Promise<void>> = [];
            const l = childSetters.length
            for (let i = 0; i < l; i++) {
                promises.push(childSetters[i].promise)
            }
            if (!l) {
                success()
            } else {
                Promise.all(promises).then(success).catch(success)
            }
        }
        this._value.displayName = this.base.displayName + '@setValue'
    }

    setInvoker(invoker: Invoker<AsyncResult<V, E>>): void {
        this._invoker = invoker
    }

    reset(): void {
        this._subscription.unsubscribe()
        this._subscription = defaultSubscription
        this._model.reset()
        this._createPromise()
        this._setMeta(setPending(this.meta))
    }

    _setMeta(meta: EntityMeta<E>): boolean {
        if (meta === this.meta) {
            return false
        }
        this.meta = meta

        const {metaOwners} = this
        for (let i = 0, l = metaOwners.length; i < l; i++) {
            metaOwners[i].isRecalculate = true
        }
        return true
    }

    _setterResolver(args: Array<any>): void {
        const oldValue: V = this._model.resolve()
        const result: AsyncResult<V, E> = this._invoker.invoke(args);
        let initial: ?V;
        let asyncResult: Promise<V>|Observable<V, E>;
        if (Array.isArray(result)) {
            initial = result[0]
            asyncResult = result[1]
        } else {
            asyncResult = result
        }

        let observable: Observable<V, E>;
        if (typeof asyncResult.then === 'function') {
            observable = promiseToObservable(((asyncResult: any): Promise<V>))
        } else if (typeof asyncResult.subscribe === 'function') {
            observable = ((asyncResult: any): Observable<V, E>);
        } else {
            throw new Error(
                `${this.base.displayName} must return Promise or Observable in AsyncResult`
            )
        }

        this._createPromise()
        this._subscription.unsubscribe()

        this._subscription = observable.subscribe(
            new RollbackObserver((this: Observer<?V, E>), this._model, oldValue)
        )
        this._setMeta(setPending(this.meta))
        if (initial) {
            this._model.set(initial)
        }
        this._notify()
    }

    _createPromise(): void {
        if (this._exposed) {
            return
        }
        const {promise, exposed} = createPromiseHandlers()
        this.promise = promise
        this._exposed = exposed
    }

    next(value: ?V): void {
        const newMeta = setSuccess(this.meta)
        const isMetaChanged = this._setMeta(newMeta)
        const isDataChanged = !value || this._model.set(value)
        if (this._exposed) {
            this._exposed.success()
            this._exposed = null
        }
        if (isMetaChanged || isDataChanged) {
            this._notify()
        }
    }

    error(err: E): void {
        if (this._exposed) {
            this._exposed.error(err)
            this._exposed = null
        }
        if (this._setMeta(setError(this.meta, err))) {
            this._notify()
        }
    }

    complete(): void {
    }

    resolve(): SetFn {
        return this._value
    }
}
