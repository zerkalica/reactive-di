/* @flow */

import promiseToObservable from '../utils/promiseToObservable'
import UpdaterImpl from './UpdaterImpl'
import type {
    AsyncModelDep,
    AsyncResult,
    AsyncSetter
} from '../nodes/nodeInterfaces'
import type {
    Observer,
    Observable,
    Subscription,
    SubscriptionSource,
    NextValue
} from '../observableInterfaces'
import type {Updater, Notifier} from './resolverInterfaces'

const defaultSubscription = {
    unsubscribe() {}
}

export default function createObserverSetter<V: Object, E>(
    model: AsyncModelDep<V, E>,
    notifier: Notifier,
    source: SubscriptionSource
): AsyncSetter<V, E> {
    const updater: Updater<V, E> = new UpdaterImpl(model, notifier);
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
            throw new Error('No observable or promise returns from model setter: ' + model.base.info.displayName)
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
