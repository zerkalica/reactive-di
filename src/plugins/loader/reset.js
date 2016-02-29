/* @flow */

import type {AsyncUpdater} from 'reactive-di/i/plugins/setterInterfaces'
import type {ResetAnnotation} from 'reactive-di/i/plugins/loaderInterfaces' // eslint-disable-line

export default function loader<V: Object, E>(
    target: AsyncUpdater<V, E>
): ResetAnnotation<V, E> {
    return {
        kind: 'reset',
        id: '',
        isModificator: true,
        target
    }
}
