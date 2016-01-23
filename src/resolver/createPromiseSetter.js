/* @flow */

import type {PromiseSetter, SetterResultValue, AsyncModelDep} from '../nodes/nodeInterfaces'
import type {Updater, Notifier} from './resolverInterfaces'
import UpdaterImpl from './UpdaterImpl'

export default function createPromiseSetter<V: Object, E>(
    model: AsyncModelDep<V, E>,
    notifier: Notifier
): PromiseSetter<V> {
    const updater: Updater<V, E> = new UpdaterImpl(model, notifier);

    return function promiseSetter(result: SetterResultValue<V>): void {
        if (typeof result.then === 'function') {
            updater.pending();
            (result: Promise<V>).then(updater.success).catch(updater.error)
        } else {
            updater.success(((result: any): V))
        }
    }
}
