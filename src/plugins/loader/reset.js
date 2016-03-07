/* @flow */

import type {AsyncUpdater} from 'reactive-di/i/plugins/setterInterfaces'
import type {ResetAnnotation} from 'reactive-di/i/plugins/loaderInterfaces'
import driver from 'reactive-di/pluginsCommon/driver'

export function reset<V: Object, E>(
    target: AsyncUpdater<V, E>
): ResetAnnotation<V, E> {
    return {
        kind: 'reset',
        id: '',
        isModificator: true,
        target
    }
}

export function resetAnnotation<V: Object, E>(
    target: AsyncUpdater<V, E>
): AsyncUpdater<V, E> {
    return driver.annotate(target, reset(target))
}
