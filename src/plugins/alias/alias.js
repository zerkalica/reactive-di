/* @flow */
import type {
    RawAnnotation,
    DependencyKey
} from 'reactive-di/i/coreInterfaces'

import {
    rdi
} from 'reactive-di/core/annotationDriver'

export function alias(target: DependencyKey, aliasTarget: DependencyKey): RawAnnotation {
    return {
        kind: 'alias',
        target,
        alias: aliasTarget
    }
}

export function aliasAnn(
    aliasTarget: Dependency
): (target: Dependency) => Dependency {
    return function _alias(target: Dependency): Dependency {
        rdi.set(target, {
            kind: 'alias',
            alias: aliasTarget
        })
        return target
    }
}
