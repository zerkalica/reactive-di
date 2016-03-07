/* @flow */

import type {DepItem} from 'reactive-di/i/annotationInterfaces'
import type {SyncUpdater} from 'reactive-di/i/plugins/setterInterfaces'
import type {SyncSetterAnnotation} from 'reactive-di/i/plugins/setterInterfaces'
import driver from 'reactive-di/pluginsCommon/driver'

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

export function syncsetterAnnotation<V: Function, M: Object>(
    model: Class<M>,
    ...deps: Array<DepItem>
): (target: V) => V {
    return function _syncsetter(
        target: V
    ): V {
        return driver.annotate(target, syncsetter(target, model, ...deps))
    }
}
