/* @flow */

import type {DepItem} from 'reactive-di/i/annotationInterfaces'
import type {ClassAnnotation} from 'reactive-di/i/pluginsInterfaces'
import annotationSingleton from 'reactive-di/core/annotationSingleton'

export function klass(
    target: Function,
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
        annotationSingleton.push(klass(target, ...deps))
        return target
    }
}
