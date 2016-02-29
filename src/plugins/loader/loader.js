/* @flow */

import type {DepItem} from 'reactive-di/i/annotationInterfaces'
import type {AsyncUpdater} from 'reactive-di/i/plugins/setterInterfaces'
import type {LoaderAnnotation} from 'reactive-di/i/plugins/loaderInterfaces' // eslint-disable-line

export default function loader<V: Object, E>(
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
