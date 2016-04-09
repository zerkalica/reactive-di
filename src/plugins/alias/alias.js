/* @flow */
import type {DependencyKey} from 'reactive-di/i/coreInterfaces'
import type {AliasAnnotation} from 'reactive-di/i/pluginsInterfaces'
import driver from 'reactive-di/core/annotationDriver'

export function alias(target: DependencyKey, aliasTarget: DependencyKey): AliasAnnotation {
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
        driver.annotate(target, (alias(target, aliasTarget): Annotation))
        return target
    }
}
