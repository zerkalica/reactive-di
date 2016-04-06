/* @flow */
import type {
    DepItem
} from 'reactive-di/i/annotationInterfaces'

import type {MiddlewareAnnotation} from 'reactive-di/i/pluginsInterfaces'

export function middleware(target: Function, ...sources: Array<DepItem>): MiddlewareAnnotation {
    return {
        kind: 'middleware',
        target,
        sources
    }
}
