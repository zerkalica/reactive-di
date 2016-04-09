/* @flow */
import type {
    Dependency,
    DependencyKey
} from 'reactive-di/i/coreInterfaces'

import type {ValueAnnotation} from 'reactive-di/i/pluginsInterfaces'
import driver from 'reactive-di/core/annotationDriver'

export function value(target: DependencyKey, val?: any): ValueAnnotation {
    return {
        kind: 'value',
        target,
        value: val
    }
}

export function valueAnn(
    val?: any
): (target: Dependency) => Dependency {
    return function _value(target: Dependency): Dependency {
        driver.annotate(target, (value(target, val): Annotation))
        return target
    }
}
