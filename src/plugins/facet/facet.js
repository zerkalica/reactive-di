/* @flow */

import type {DepItem} from 'reactive-di/i/annotationInterfaces'
import type {FacetAnnotation} from 'reactive-di/i/pluginsInterfaces'
import annotationSingleton from 'reactive-di/core/annotationSingleton'

export function facet(
    target: Function,
    ...deps: Array<DepItem>
): FacetAnnotation {
    return {
        kind: 'facet',
        target,
        deps
    }
}

export function facetAnn<V: Function>(
    ...deps: Array<DepItem>
): (target: V) => V {
    return function __facet(target: V): V {
        annotationSingleton.push(facet(target, ...deps))
        return target
    }
}
