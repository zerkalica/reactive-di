/* @flow */

import type {Observer, Observable, Subscription} from '../observableInterfaces'

type Cancelable = {
    cancel(): void;
}

// implements Observable<T, E: Error>
class PromiseObservable<T, E: Error> {

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
                    observer.next(data)
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

export default function promiseToObservable<T>(resolver: Promise<T>|Observable): Observable {
    if (typeof resolver.subscribe === 'function') {
        return ((resolver: any): Observable)
    } else if (typeof resolver.then === 'function') {
        return new PromiseObservable(((resolver: any): Promise<T>))
    } else {
        throw new TypeError('resolver argument is not a Promise or Observable')
    }
}
