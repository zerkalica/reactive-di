/* @flow */

import type {Dependency} from 'reactive-di/i/annotationInterfaces'
import type {MetaAnnotation} from 'reactive-di/i/plugins/metaInterfaces' // eslint-disable-line

export default function meta<V>(target: Dependency<V>): MetaAnnotation<V> {
    return {
        kind: 'meta',
        id: '',
        target
    }
}
