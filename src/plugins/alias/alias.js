/* @flow */

import type {AliasAnnotation} from 'reactive-di/i/pluginsInterfaces'
import annotationSingleton from 'reactive-di/core/annotationSingleton'

export function alias(target: Function, aliasTarget: Function): AliasAnnotation {
    return {
        kind: 'alias',
        target,
        alias: aliasTarget
    }
}

export function aliasAnn<V: Function>(target: V, aliasTarget: Function): V {
    annotationSingleton.push(alias(target, aliasTarget))
    return target
}
