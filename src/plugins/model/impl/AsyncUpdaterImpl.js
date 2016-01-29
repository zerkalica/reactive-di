/* @flow */

import merge from '../../../utils/merge'
import EntityMetaImpl from '../EntityMetaImpl'
import type {Notify} from '../../../modelInterfaces'
import type {
    DepBase,
    Cacheable
} from '../../../nodeInterfaces'
import type {
    Observer,
    Subscription,
    Observable
} from '../../../observableInterfaces'
import type {
    MetaSource,
    AsyncUpdater,
    EntityMeta
} from '../modelInterfaces'

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

type ValueRef<V> = {
    value: V;
}

type Setter<V> = (value: V) => boolean;

// implements Observer
class ModelDepObserver<V, E> {
    _set: Setter<V>;
    _notifyData: () => void;
    _notifyMeta: () => void;
    _valueRef: ValueRef<V>;
    _metaRef: MetaSource<E>;
    _subscription: Subscription;

    constructor(
        set: Setter<V>,
        valueRef: ValueRef<V>,
        metaRef: MetaSource<E>,
        subscription: Subscription,
        notifyData: () => void,
        notifyMeta: () => void
    ) {
        this._set = set
        this._notifyData = notifyData
        this._notifyMeta = notifyMeta
        this._subscription = subscription
        this._valueRef = valueRef
        this._metaRef = metaRef
    }

    next(value: V): void {
        if (this._set(value)) {
            this._valueRef.value = value
            this._notifyData()
        }
        const metaRef = this._metaRef
        const newMeta: EntityMeta<E> = setSuccess(metaRef.meta);
        if (newMeta !== metaRef.meta) {
            metaRef.meta = newMeta
            this._notifyMeta()
        }
    }

    error(errorValue: E): void {
        const metaRef = this._metaRef
        const newMeta: EntityMeta<E> = setError(metaRef.meta, errorValue);
        if (newMeta !== metaRef.meta) {
            metaRef.meta = newMeta
            this._notifyMeta()
        }
        this._subscription.unsubscribe()
    }

    complete(completeValue?: V): void {
        this._subscription.unsubscribe()
    }
}

const defaultSubscription: Subscription = {
    unsubscribe() {}
};

// implements AsyncUpdater
export default class AsyncUpdaterImpl<V: Object, E> {
    meta: EntityMeta<E>;
    metaOwners: Array<Cacheable>;

    subscribe: (value: Observable<V, E>) => void;
    unsubscribe: () => void;
    isSubscribed: boolean;

    constructor(
        setter: Setter<V>,
        valueRef: ValueRef<V>,
        notify: Notify,
        dataOwners: Array<Cacheable>
    ) {
        this.meta = new EntityMetaImpl()
        const self = this
        const metaOwners = this.metaOwners = []

        function notifyData(): void {
            for (let i = 0, l = dataOwners.length; i < l; i++) {
                dataOwners[i].isRecalculate = true
            }
            notify()
        }

        function notifyMeta(): void {
            for (let i = 0, l = metaOwners.length; i < l; i++) {
                metaOwners[i].isRecalculate = true
            }
            notify()
        }

        function pending(): void {
            const newMeta: EntityMeta<E> = setPending(self.meta);
            if (self.meta === newMeta) {
                // if previous value is pending - do not handle this value: only first
                return
            }
            self.meta = newMeta
            notifyMeta()
        }

        let subscription: Subscription = defaultSubscription;

        const subscriptionRef: Subscription = {
            unsubscribe(): void {
                subscription.unsubscribe()
            }
        };

        const observer: Observer<V, E> = new ModelDepObserver(
            setter,
            valueRef,
            (this: MetaSource<E>),
            subscriptionRef,
            notifyData,
            notifyMeta
        );

        this.subscribe = function subscribe(value: Observable<V, E>): void {
            subscription.unsubscribe()
            pending()
            subscription = value.subscribe(observer)
            self.isSubscribed = true
        }

        this.unsubscribe = function unsubscribe(): void {
            subscription.unsubscribe()
            subscription = defaultSubscription
            self.isSubscribed = false
        }
    }
}
