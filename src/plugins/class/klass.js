/* @flow */

import type {
    DepItem,
    RawAnnotation
} from 'reactive-di'

import {
    rdi
} from 'reactive-di/core/annotationDriver'

export function klass(...deps: Array<DepItem>): RawAnnotation {
    return {
        kind: 'klass',
        deps
    }
}

export function klassAnn<V: Function>(...deps: Array<DepItem>): (target: V) => V {
    return function __klass(target: V): V {
        rdi.set(target, {
            kind: 'klass',
            deps
        })
        return target
    }
}
