/* @flow */
import type {
    RawAnnotation,
    Dependency
} from 'reactive-di'

import {
    rdi
} from 'reactive-di/core/annotationDriver'

export function value(
    rec: {
        value?: mixed,
        key?: string
    } = {}
): RawAnnotation {
    return {
        kind: 'value',
        key: rec.key,
        value: rec.value
    }
}

export function valueAnn(
    rec: {
        value?: mixed,
        key?: string
    } = {}
): (target: Dependency) => Dependency {
    return function _value(target: Dependency): Dependency {
        rdi.set(target, {
            kind: 'value',
            value: rec.value,
            key: rec.key
        })
        return target
    }
}
