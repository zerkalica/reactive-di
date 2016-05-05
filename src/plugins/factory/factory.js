/* @flow */

import type {
    RawAnnotation,
    DepItem
} from 'reactive-di/i/coreInterfaces'

import {
    rdi
} from 'reactive-di/core/annotationDriver'

export function factory(
    target: Function,
    ...deps: Array<DepItem>
): RawAnnotation {
    return {
        kind: 'factory',
        target,
        deps
    }
}

export function factoryAnn<V: Function>(
    ...deps: Array<DepItem>
): (target: V) => V {
    return function __factory(target: V): V {
        rdi.set(target, {
            kind: 'factory',
            deps
        })
        return target
    }
}
