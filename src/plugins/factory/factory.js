/* @flow */

import type {DepFn, DepItem} from 'reactive-di/i/annotationInterfaces'
import type {FactoryAnnotation} from 'reactive-di/i/plugins/factoryInterfaces'
import driver from 'reactive-di/pluginsCommon/driver'

export function factory<V: Function>(
    target: DepFn<V>,
    ...deps: Array<DepItem>
): FactoryAnnotation<V> {
    return {
        kind: 'factory',
        id: '',
        target,
        deps
    }
}

export function factoryAnnotation<V: Function>(
    ...deps: Array<DepItem>
): (target: V) => V {
    return function __factory(
        target: V
    ): V {
        return driver.annotate(target, factory(target, ...deps))
    }
}
