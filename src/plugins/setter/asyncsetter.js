/* @flow */
import driver from 'reactive-di/pluginsCommon/driver'

import type {DepItem} from 'reactive-di/i/annotationInterfaces'
import type {AsyncUpdater} from 'reactive-di/i/plugins/setterInterfaces'
import type {AsyncSetterAnnotation} from 'reactive-di/i/plugins/setterInterfaces'

export function asyncsetter<V: Object, E>(
    target: AsyncUpdater<V, E>,
    model: Class<V>,
    ...deps: Array<DepItem>
): AsyncSetterAnnotation<V, E> {
    return {
        kind: 'asyncsetter',
        id: '',
        isPending: false,
        model,
        deps,
        target
    }
}

export function asyncsetterAnnotation<V: Object, M: Object>(
    model: Class<M>,
    ...deps: Array<DepItem>
): (target: V) => V {
    return (target: V) => driver.annotate(target, asyncsetter(target, model, ...deps))
}
