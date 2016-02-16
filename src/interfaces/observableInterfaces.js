/* @flow */

export type Observer<V, E> = {
    next(value: V): void;
    error(errorValue: E): void;
    complete(completeValue?: V): void;
}

export type SubscriptionObserver<V, E> = {
    next(value: V): void;
    error(errorValue: E): void;
    complete(completeValue?: V): void;
}

export type Subscription = {
    unsubscribe() : void;
}

export type Observable<V, E> = {
    subscribe(observer : Observer<V, E>) : Subscription;
}

export type SubscriptionSource = {
    subscription: Subscription;
}

export type StatefullObservable<V, E> = {
    observable: Observable<V, E>;
    initialData: V;
}
