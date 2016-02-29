/* @flow */

import type {ObservableAnnotation} from 'reactive-di/i/plugins/observableInterfaces' // eslint-disable-line

export default function observable<V: Object>(
    target: V
): ObservableAnnotation<V> {
    return {
        kind: 'observable',
        id: '',
        target
    }
}
