/* @flow */

import type {DepItem} from 'reactive-di/i/annotationInterfaces'
import type {AsyncUpdater} from 'reactive-di/i/plugins/setterInterfaces'
import type {AsyncSetterAnnotation} from 'reactive-di/i/plugins/setterInterfaces'
import type {AnnotationDriver} from 'reactive-di/i/annotationInterfaces'

export function asyncsetter<V: Object, E>(
    target: AsyncUpdater<V, E>,
    model: Class<V>,
    ...deps: Array<DepItem>
): AsyncSetterAnnotation<V, E> {
    return {
        kind: 'asyncsetter',
        id: '',
        model,
        deps,
        target
    }
}

export function createAsyncSetter<M: Object, V: AsyncUpdater<M, *>>(
    driver: AnnotationDriver
): (
    model: Class<M>,
    ...deps: Array<DepItem>
) => (target: V) => V {
    return function _asyncsetter(
        model: Class<M>,
        ...deps: Array<DepItem>
    ): (target: V) => V {
        return function __asyncsetter(
            target: V
        ): V {
            return driver.annotate(target, asyncsetter(target, model, ...deps))
        }
    }
}
