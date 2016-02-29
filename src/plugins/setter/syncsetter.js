/* @flow */

import type {DepItem} from 'reactive-di/i/annotationInterfaces'
import type {SyncUpdater} from 'reactive-di/i/plugins/setterInterfaces'
import type {SyncSetterAnnotation} from 'reactive-di/i/plugins/setterInterfaces'

export default function syncsetter<V: Object>(
    model: Class<V>,
    target: SyncUpdater<V>,
    ...deps: Array<DepItem>
): SyncSetterAnnotation<V> {
    return {
        kind: 'syncsetter',
        model,
        deps,
        target
    }
}
