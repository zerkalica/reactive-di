/* @flow */

import type {DepItem} from 'reactive-di/i/annotationInterfaces'
import type {AsyncUpdater} from 'reactive-di/i/plugins/setterInterfaces'
import type {LoaderAnnotation} from 'reactive-di/i/plugins/loaderInterfaces' // eslint-disable-line
import type {AnnotationDriver} from 'reactive-di/i/annotationInterfaces'

export function loader<V: Object, E>(
    target: AsyncUpdater<V, E>,
    model: Class<V>,
    ...deps: Array<DepItem>
): LoaderAnnotation<V, E> {
    return {
        kind: 'loader',
        id: '',
        model,
        target,
        deps
    }
}

export function createLoader<M: Object, V: AsyncUpdater<M, *>>(
    driver: AnnotationDriver
): (
    model: Class<M>,
    ...deps: Array<DepItem>
) => (target: V) => V {
    return function _loader(
        model: Class<M>,
        ...deps: Array<DepItem>
    ): (target: V) => V {
        return function __loader(
            target: V
        ): V {
            return driver.annotate(target, loader(target, model, ...deps))
        }
    }
}
