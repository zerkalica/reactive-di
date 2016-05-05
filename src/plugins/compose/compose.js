/* @flow */

import type {
    RawAnnotation,
    DepItem
} from 'reactive-di/i/coreInterfaces'

import {
    rdi
} from 'reactive-di/core/annotationDriver'

export function compose(
    target: Function,
    ...deps: Array<DepItem>
): RawAnnotation {
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
        rdi.set(target, {
            kind: 'compose',
            deps
        })
        return target
    }
}
