/* @flow */

import promiseToObservable from '../utils/promiseToObservable'
import type {AsyncResult} from '../annotations/annotationInterfaces'
import type {
    AsyncSetter,
    AsyncUpdater
} from '../nodes/nodeInterfaces'
import type {
    Observer,
    Observable,
    SubscriptionSource,
    NextValue
} from '../observableInterfaces'

export default function createObserverSetter<V: Object, E>(
    updater: AsyncUpdater<V, E>,
    source: SubscriptionSource
): AsyncSetter<V, E> {
    function next(value: NextValue<V>): void {
        if (value.kind === 'pending') {
            updater.pending()
        } else {
            updater.success(value.data)
        }
    }

    return function observerSetter(data: AsyncResult<V, E>): void {
        if (
            typeof data.subscribe !== 'function'
            || typeof data.then !== 'function'
        ) {
            throw new Error('No observable or promise returns from model setter')
        }

        source.subscription.unsubscribe()
        const observable: Observable<V, E> = promiseToObservable(data);
        const observer: Observer<V, E> = {
            complete: next,
            next,
            error: updater.error
        };
        observer.next({kind: 'pending'})
        source.subscription = observable.subscribe(observer)
    }
}
