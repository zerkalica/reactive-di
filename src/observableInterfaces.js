/* @flow */

export type NextValue<V> = {
    kind: 'data';
    data: V;
} | {
    kind: 'pending';
}

export type Observer<V, E> = {
    next(value: NextValue<V>): void;
    error(errorValue: E): void;
    complete(completeValue: V): void;
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
