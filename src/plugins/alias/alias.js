/* @flow */

import type {AliasAnnotation} from 'reactive-di/i/pluginsInterfaces'
import driver from 'reactive-di/core/annotationDriver'

export function alias(target: Function, aliasTarget: Function): AliasAnnotation {
    return {
        kind: 'alias',
        target,
        alias: aliasTarget
    }
}

export function aliasAnn(
    aliasTarget: Function
): (target: Function) => Function {
    return function _alias(target: Function): Function {
        driver.set(target, alias(target, aliasTarget))
        return target
    }
}
