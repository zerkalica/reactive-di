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
    DepId,
    Info
} from 'reactive-di/i/annotationInterfaces'
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

const defaultSubscription: Subscription = {
    unsubscribe() {}
};

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

    _exposed: ExposedPromise<void, void>;

    constructor(
        id: DepId,
        info: Info,
        notify: () => void,
        model: ModelDep<V>
    ) {
        this.kind = 'asyncsetter'
        this.base = new DepBaseImpl(id, info)
        this.metaOwners = []
        this.meta = new EntityMetaImpl({
            pending: true
        })
        const childSetters: Array<PromiseSource> = this.childSetters = [];

        this._notify = notify
        this._model = model
        this._subscription = defaultSubscription
        this._createPromise()

        const self = this

        this._value = function setValue(...args: any): void {
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
        this._value.displayName = this.base.info.displayName + '@setValue'
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
        const result: AsyncResult<V, E> = this._invoker.invoke(args);
        const [initial, async] = result
        let observable: Observable<V, E>;
        if (typeof async.then === 'function') {
            observable = promiseToObservable(((async: any): Promise<V>))
        } else if (typeof async.subscribe === 'function') {
            observable = ((async: any): Observable<V, E>);
        } else {
            throw new Error(`${this.base.info.displayName} must return Promise or Observable`)
        }

        this._createPromise()
        this._subscription.unsubscribe()
        this._subscription = observable.subscribe((this: Observer<V, E>))
        if (initial) {
            this._model.set(initial)
        }
    }

    _createPromise(): void {
        if (this._exposed) {
            return
        }
        const {promise, exposed} = createPromiseHandlers()
        this.promise = promise
        this._exposed = exposed
    }

    next(value: V): void {
        const newMeta = setSuccess(this.meta)
        const isMetaChanged = this._setMeta(newMeta)
        const isDataChanged = this._model.set(value)
        if (isMetaChanged || isDataChanged) {
            this._notify()
        }
        this._exposed.success()
    }

    error(err: E): void {
        if (this._setMeta(setError(this.meta, err))) {
            this._notify()
        }
        this._exposed.error()
    }

    complete(): void {
    }

    resolve(): SetFn {
        return this._value
    }
}
