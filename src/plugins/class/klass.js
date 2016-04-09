/* @flow */

import type {
    Dependency,
    DepItem
} from 'reactive-di/i/coreInterfaces'
import type {ClassAnnotation} from 'reactive-di/i/pluginsInterfaces'
import driver from 'reactive-di/core/annotationDriver'

export function klass(
    target: Dependency,
    ...deps: Array<DepItem>
): ClassAnnotation {
    return {
        kind: 'klass',
        target,
        deps
    }
}

export function klassAnn<V: Function>(
    ...deps: Array<DepItem>
): (target: V) => V {
    return function __klass(target: V): V {
        driver.annotate(target, klass(target, ...deps))
        return target
    }
}
