/* @flow */
import type {
    RawAnnotation,
    Dependency
} from 'reactive-di'

import {
    rdi
} from 'reactive-di/core/annotationDriver'

export function value(target: Dependency, val?: any): RawAnnotation {
    return {
        kind: 'value',
        target,
        value: val
    }
}

export function valueAnn(val?: any): (target: Dependency) => Dependency {
    return function _value(target: Dependency): Dependency {
        rdi.set(target, {
            kind: 'value',
            value: val
        })
        return target
    }
}
