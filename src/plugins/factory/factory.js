/* @flow */

import type {DepFn, DepItem} from 'reactive-di/i/annotationInterfaces'
import type {FactoryAnnotation} from 'reactive-di/i/plugins/factoryInterfaces'

export default function factory<V>(
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
