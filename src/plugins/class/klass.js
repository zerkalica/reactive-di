/* @flow */

import type {
    Dependency,
    DepItem,
    RawAnnotation
} from 'reactive-di'

import {
    rdi
} from 'reactive-di/core/annotationDriver'

export function klass(
    target: Dependency,
    ...deps: Array<DepItem>
): RawAnnotation {
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
        rdi.set(target, {
            kind: 'klass',
            deps
        })
        return target
    }
}
