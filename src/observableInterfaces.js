/* @flow */

export type Observer<T, E> = {
    next(value: T): void;
    error(errorValue: E): void;
    complete(completeValue: T): void;
}

export type Subscription = {
    unsubscribe() : void;
}

export type Observable = {
    subscribe(observer : Observer) : Subscription;
}
