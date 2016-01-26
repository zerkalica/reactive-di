/* @flow */

import promiseToObservable from '../utils/promiseToObservable'
import type {AsyncResult} from '../annotations/annotationInterfaces'
import type {AsyncUpdater} from '../nodes/nodeInterfaces'
import type {
    Observer,
    Observable,
    Subscription,
    NextValue
} from '../observableInterfaces'

export default function createObserverSetter<V: Object, E>(
    updater: AsyncUpdater<V, E>
) : (data: AsyncResult<V, E>) => Subscription {
    function next(value: NextValue<V>): void {
        if (value.kind === 'pending') {
            updater.pending()
        } else {
            updater.success(value.data)
        }
    }

    return function observerSetter(data: AsyncResult<V, E>): Subscription {
        if (
            typeof data.subscribe !== 'function'
            || typeof data.then !== 'function'
        ) {
            throw new Error('No observable or promise returns from model setter')
        }

        const observable: Observable<V, E> = promiseToObservable(data);
        const observer: Observer<V, E> = {
            complete: next,
            next,
            error: updater.error
        };
        observer.next({kind: 'pending'})

        return observable.subscribe(observer)
    }
}
