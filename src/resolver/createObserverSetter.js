/* @flow */

import type {PromiseSetter, LoaderResult, AsyncModelDep} from '../nodes/nodeInterfaces'
import type {Updater, Notifier} from './resolverInterfaces'
import UpdaterImpl from './UpdaterImpl'
import type {Observer, NextValue} from '../observableInterfaces'

export default function createObserverSetter<V: Object, E>(
    model: AsyncModelDep<V, E>,
    notifier: Notifier
): Observer<V, E> {
    const updater: Updater<V, E> = new UpdaterImpl(model, notifier);
    const {pending, success, error} = updater

    function next(value: NextValue<V>): void {
        if (value.kind === 'pending') {
            pending()
        } else {
            success(value.data)
        }
    }


    return {
        complete: next,
        next,
        error
    }
}
