/* @flow */

import type {DepItem} from 'reactive-di/i/coreInterfaces'
import type {FacetAnnotation} from 'reactive-di/i/pluginsInterfaces'
import driver from 'reactive-di/core/annotationDriver'

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
        driver.annotate(target, facet(target, ...deps))
        return target
    }
}
