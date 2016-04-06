/* @flow */

import type {ValueAnnotation} from 'reactive-di/i/pluginsInterfaces'
import driver from 'reactive-di/core/annotationDriver'

export function value(target: Function, val: any): ValueAnnotation {
    return {
        kind: 'value',
        target,
        value: val
    }
}

export function valueAnn(
    val: any
): (target: Function) => Function {
    return function _value(target: Function): Function {
        driver.set(target, val)
        return target
    }
}
