/* @flow */

import type {ValueAnnotation} from 'reactive-di/i/pluginsInterfaces'
import annotationSingleton from 'reactive-di/core/annotationSingleton'

export function value(target: Function, val: any): ValueAnnotation {
    return {
        kind: 'value',
        target,
        value: val
    }
}

export function valueAnn<V: Function>(target: V): V {
    annotationSingleton.push(value(target))
    return target
}
