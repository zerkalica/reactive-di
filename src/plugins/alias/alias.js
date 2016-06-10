/* @flow */
import type {
    RawAnnotation,
    Dependency,
    DependencyKey
} from 'reactive-di'

import {
    rdi
} from 'reactive-di/core/annotationDriver'

export function alias(aliasTarget: DependencyKey): RawAnnotation {
    return {
        kind: 'alias',
        alias: aliasTarget
    }
}

export function aliasAnn(aliasTarget: Dependency): (target: Dependency) => Dependency {
    return function _alias(target: Dependency): Dependency {
        rdi.set(target, {
            kind: 'alias',
            alias: aliasTarget
        })
        return target
    }
}
