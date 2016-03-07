/* @flow */

import type {
    ObservableAnnotation
} from 'reactive-di/i/plugins/observableInterfaces' // eslint-disable-line
import type {DepItem} from 'reactive-di/i/annotationInterfaces'
import driver from 'reactive-di/pluginsCommon/driver'

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

export function observableAnnotation<V: Object>(deps: V): () => null {
    return driver.annotate(() => null, observable(deps))
}
