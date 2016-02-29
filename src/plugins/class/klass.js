/* @flow */

import type {DepItem} from 'reactive-di/i/annotationInterfaces'
import type {ClassAnnotation} from 'reactive-di/i/plugins/classInterfaces'
import type {AnnotationDriver} from 'reactive-di/i/annotationInterfaces'

export function klass<V: Object>(
    target: Class<V>,
    ...deps: Array<DepItem>
): ClassAnnotation<V> {
    return {
        kind: 'class',
        id: '',
        target,
        deps
    }
}

export function createKlass<V: Function>(
    driver: AnnotationDriver
): (...deps: Array<DepItem>) => (target: V) => V {
    return function _klass(
        ...deps: Array<DepItem>
    ): (target: V) => V {
        return function __klass(
            target: V
        ): V {
            return driver.annotate(target, klass(target, ...deps))
        }
    }
}
