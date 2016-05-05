/* @flow */

import type {
    DepItem
} from 'reactive-di/i/coreInterfaces'

import {
    paramtypes
} from 'reactive-di/core/annotationDriver'

export default function inject<V: Function>(
    ...deps: Array<DepItem>
): (target: V) => V {
    return function _inject(target: V): V {
        paramtypes.set(target, deps)
        return target
    }
}
