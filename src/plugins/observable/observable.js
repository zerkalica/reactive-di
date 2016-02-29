/* @flow */

import type {ObservableAnnotation} from 'reactive-di/i/plugins/observableInterfaces' // eslint-disable-line
import type {AnnotationDriver} from 'reactive-di/i/annotationInterfaces'

export function observable<V: Object>(
    target: V
): ObservableAnnotation<V> {
    return {
        kind: 'observable',
        id: '',
        target
    }
}

export function createObservable<V: Object>(
    driver: AnnotationDriver
): (target: V) => () => null {
    return function _observable(target: V): () => null {
        return driver.annotate(() => null, observable(target))
    }
}
