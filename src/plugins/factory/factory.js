/* @flow */

import type {
    RawAnnotation,
    DepItem
} from 'reactive-di'

import {
    rdi
} from 'reactive-di/core/annotationDriver'

export function factory(...deps: Array<DepItem>): RawAnnotation {
    return {
        kind: 'factory',
        deps
    }
}

export function factoryAnn<V: Function>(...deps: Array<DepItem>): (target: V) => V {
    return function __factory(target: V): V {
        rdi.set(target, {
            kind: 'factory',
            deps
        })
        return target
    }
}
