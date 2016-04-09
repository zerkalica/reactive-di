/* @flow */

import type {DepItem} from 'reactive-di/i/coreInterfaces'
import type {FactoryAnnotation} from 'reactive-di/i/pluginsInterfaces'
import driver from 'reactive-di/core/annotationDriver'

export function factory(
    target: Function,
    ...deps: Array<DepItem>
): FactoryAnnotation {
    return {
        kind: 'factory',
        target,
        deps
    }
}

export function factoryAnn<V: Function>(
    ...deps: Array<DepItem>
): (target: V) => V {
    return function __factory(target: V): V {
        driver.annotate(target, factory(target, ...deps))
        return target
    }
}
