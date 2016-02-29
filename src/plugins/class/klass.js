/* @flow */

import type {DepItem} from 'reactive-di/i/annotationInterfaces'
import type {ClassAnnotation} from 'reactive-di/i/plugins/classInterfaces'

export default function classAnnotation<V: Object>(
    target: Class<V>,
    ...deps: Array<DepItem>
): ClassAnnotation<V> {
    return {
        kind: 'class',
        id: '',
        target,
        deps
    }
}
