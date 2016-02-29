/* @flow */

import type {DepItem} from 'reactive-di/i/annotationInterfaces'
import type {AsyncUpdater} from 'reactive-di/i/plugins/setterInterfaces'
import type {AsyncSetterAnnotation} from 'reactive-di/i/plugins/setterInterfaces'

export default function asyncsetter<V: Object, E>(
    model: Class<V>,
    target: AsyncUpdater<V, E>,
    ...deps: Array<DepItem>
): AsyncSetterAnnotation<V, E> {
    return {
        kind: 'asyncsetter',
        model,
        deps,
        target
    }
}
