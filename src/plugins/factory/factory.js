/* @flow */

import type {DepFn, DepItem} from 'reactive-di/i/annotationInterfaces'
import type {FactoryAnnotation} from 'reactive-di/i/plugins/factoryInterfaces'
import type {AnnotationDriver} from 'reactive-di/i/annotationInterfaces'

export function factory<V>(
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

export function createFactory<V: Function>(
    driver: AnnotationDriver
): (...deps: Array<DepItem>) => (target: V) => V {
    return function _factory(
        ...deps: Array<DepItem>
    ): (target: V) => V {
        return function __factory(
            target: V
        ): V {
            return driver.annotate(target, factory(target, ...deps))
        }
    }
}
