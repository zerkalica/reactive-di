/* @flow */

import type {
    ObservableAnnotation
} from 'reactive-di/i/plugins/observableInterfaces' // eslint-disable-line
import type {
    DepItem,
    AnnotationDriver
} from 'reactive-di/i/annotationInterfaces'

function getObservableParams<V: Object>(value: V): V {
    return value
}

export function observable<V: DepItem>(
    deps: V,
    target: (value: V) => V = getObservableParams
): ObservableAnnotation<V> {
    return {
        kind: 'observable',
        id: '',
        target,
        deps
    }
}

export function createObservable<V: Object>(
    driver: AnnotationDriver
): (deps: V) => () => null {
    return function _observable(deps: V): () => null {
        return driver.annotate(() => null, observable(deps))
    }
}
