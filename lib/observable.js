/* @flow */

declare class Observer<V, E> {
    next(value: V): void;
    error(errorValue: E): void;
    complete(completeValue?: any): void;
}

declare class SubscriptionObserver<V, E> {
    next(value: V): void;
    error(errorValue: E): void;
    complete(completeValue?: any): void;
}

declare class Subscription {
    unsubscribe(): void;
}

type VoidFn = () => void;

type SubscriberFunction<V, E> = (observer: SubscriptionObserver<V, E>) => (Subscription | VoidFn);

declare class Observable<V, E> {
    constructor(subscriber: SubscriberFunction): Observable<V, E>;
    // Subscribes to the sequence
    subscribe(observer: Observer<V, E>): Subscription;
    // Subscribes to the sequence with a callback, returning a promise
    forEach(onNext: (v: any) => any) : Promise;
    // Returns itself
    // [Symbol.observable]() : Observable;
    // Converts items to an Observable
    static of(...items: any): Observable;
    // Converts an observable or iterable to an Observable
    static from(observable: Observable): Observable;
    // Subclassing support
    // static get [Symbol.species]() : Constructor;
}
