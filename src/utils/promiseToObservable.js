// @flow

export default function promiseToObservable<V, E>(
    promise: Promise<V>
): Observable<V, E> {
    if (typeof promise.then !== 'function') {
        throw new TypeError('promise argument is not a Promise')
    }

    function promiseToObservableSubscriber(observer: SubscriptionObserver<V, E>): () => void {
        let isSubscribed: boolean = true

        function promiseToObservableUnsubscribe(): void {
            // todo: memory leak
            isSubscribed = false
            if (typeof promise.cancel === 'function') {
                promise.cancel()
            }
        }
        function success(data: V): void {
            if (isSubscribed) {
                observer.complete(data)
            }
        }
        function error(e: E): void {
            if (isSubscribed) {
                observer.error(e)
            }
        }
        promise.then(success).catch(error)

        return promiseToObservableUnsubscribe
    }

    return new Observable(promiseToObservableSubscriber)
}
