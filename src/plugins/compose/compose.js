/* @flow */

import type {DepItem} from 'reactive-di/i/coreInterfaces'
import type {ComposeAnnotation} from 'reactive-di/i/pluginsInterfaces'
import driver from 'reactive-di/core/annotationDriver'

export function compose(
    target: Function,
    ...deps: Array<DepItem>
): ComposeAnnotation {
    return {
        kind: 'compose',
        target,
        deps
    }
}

export function composeAnn<V: Function>(
    ...deps: Array<DepItem>
): (target: V) => V {
    return function __compose(target: V): V {
        driver.annotate(target, compose(target, ...deps))
        return target
    }
}
