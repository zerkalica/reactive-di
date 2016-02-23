/* @flow */

declare interface Observer<V, E> {
    next(value: V): void;
    error(errorValue: E): void;
    complete(completeValue?: any): void;
}

declare interface SubscriptionObserver<V, E> {
    next(value: V): void;
    error(errorValue: E): void;
    complete(completeValue?: any): void;
}

declare interface Subscription {
    unsubscribe(): void;
}

declare function SubscriberFunction(observer: SubscriptionObserver): (() => void)|Subscription;

declare interface Observable<V, E> {
    constructor(subscriber: SubscriberFunction): Observable<V, E>;

    // Subscribes to the sequence
    subscribe(observer: Observer<V, E>): Subscription;

    // Subscribes to the sequence with a callback, returning a promise
    forEach(onNext: (v: any) => any): Promise<V>;

    map<N>(mapFn: (value: V) => N): Observable<N, any>;

    // Returns itself
    // [Symbol.observable]() : Observable;

    // Converts items to an Observable
    static of(...items: any) : Observable;

    // Converts an observable or iterable to an Observable
    static from(observable: Observable|Iterator): Observable;

    // Subclassing support
    // static get [Symbol.species]() : Constructor;
}
