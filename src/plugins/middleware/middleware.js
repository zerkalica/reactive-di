/* @flow */
import type {
    DepItem
} from 'reactive-di/i/annotationInterfaces'

import type {MiddlewareAnnotation} from 'reactive-di/i/pluginsInterfaces'
import annotationSingleton from 'reactive-di/core/annotationSingleton'

export function middleware(target: Function, ...sources: Array<DepItem>): MiddlewareAnnotation {
    return {
        kind: 'middleware',
        target,
        sources
    }
}

export function middlewareAnn<V: Function>(target: V, ...sources: Array<DepItem>): V {
    annotationSingleton.push(middleware(target, ...sources))
    return target
}
