/* @flow */

import type {DepItem} from 'reactive-di/i/annotationInterfaces'
import type {SyncUpdater} from 'reactive-di/i/plugins/setterInterfaces'
import type {SyncSetterAnnotation} from 'reactive-di/i/plugins/setterInterfaces'
import type {AnnotationDriver} from 'reactive-di/i/annotationInterfaces'

export function syncsetter<V: Object>(
    target: SyncUpdater<V>,
    model: Class<V>,
    ...deps: Array<DepItem>
): SyncSetterAnnotation<V> {
    return {
        kind: 'syncsetter',
        id: '',
        model,
        deps,
        target
    }
}

export function createSyncSetter<M: Object, V: SyncUpdater<M>>(
    driver: AnnotationDriver
): (
    model: Class<M>,
    ...deps: Array<DepItem>
) => (target: V) => V {
    return function _syncsetter(
        model: Class<M>,
        ...deps: Array<DepItem>
    ): (target: V) => V {
        return function __syncsetter(
            target: V
        ): V {
            return driver.annotate(target, syncsetter(target, model, ...deps))
        }
    }
}
