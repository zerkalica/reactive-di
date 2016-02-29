/* @flow */

import type {Dependency} from 'reactive-di/i/annotationInterfaces'
import type {MetaAnnotation} from 'reactive-di/i/plugins/metaInterfaces' // eslint-disable-line
import type {AnnotationDriver} from 'reactive-di/i/annotationInterfaces'

export function meta<V>(target: Dependency<V>): MetaAnnotation<V> {
    return {
        kind: 'meta',
        id: '',
        target
    }
}

export function createMeta<V: Function>(
    driver: AnnotationDriver
): (target: V) => () => null {
    return function _meta(target: V): () => null {
        return driver.annotate(() => null, meta(target))
    }
}
