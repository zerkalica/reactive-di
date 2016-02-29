/* @flow */

import type {AsyncUpdater} from 'reactive-di/i/plugins/setterInterfaces'
import type {ResetAnnotation} from 'reactive-di/i/plugins/loaderInterfaces'
import type {AnnotationDriver} from 'reactive-di/i/annotationInterfaces'

export function reset<V: Object, E>(
    target: AsyncUpdater<V, E>
): ResetAnnotation<V, E> {
    return {
        kind: 'reset',
        id: '',
        isModificator: true,
        target
    }
}

export function createReset<V: Object, E>(
    driver: AnnotationDriver
): (target: AsyncUpdater<V, E>) => AsyncUpdater<V, E> {
    return function _reset(target: AsyncUpdater<V, E>): AsyncUpdater<V, E> {
        return driver.annotate(target, reset(target))
    }
}
