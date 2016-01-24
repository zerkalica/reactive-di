/* @flow */

import type {Observer, Observable, Subscription} from '../observableInterfaces'

type Cancelable = {
    cancel(): void;
}

// implements Observable<T, E>
class PromiseObservable<T, E> {

    subscribe: (observer: Observer) => Subscription;

    constructor(promise: Promise<T>) {
        let isSubscribed: boolean = true;
        function unsubscribeCancelable(): void {
            isSubscribed = false;
            ((promise: any): Cancelable).cancel();
        }

        function unsubscribeFallback(): void {
            // todo: memory leak
            isSubscribed = false
        }

        const unsubscribe = typeof promise.cancel === 'function'
            ? unsubscribeCancelable
            : unsubscribeFallback;

        this.subscribe = function subscribe(observer: Observer): Subscription {
            function success(data: T): void {
                if (isSubscribed) {
                    observer.next({kind: 'data', data})
                }
            }
            function error(e: E): void {
                if (isSubscribed) {
                    observer.error(e)
                }
            }

            promise.then(success).catch(error)

            return {unsubscribe}
        }
    }
}

export default function promiseToObservable<V, E>(
    resolver: Promise<V>|Observable<V, E>
): Observable<V, E> {
    if (typeof resolver.subscribe === 'function') {
        return ((resolver: any): Observable<V, E>)
    } else if (typeof resolver.then === 'function') {
        return new PromiseObservable(((resolver: any): Promise<V>))
    } else {
        throw new TypeError('resolver argument is not a Promise or Observable')
    }
}
