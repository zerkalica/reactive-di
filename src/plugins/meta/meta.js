/* @flow */

import type {Dependency} from 'reactive-di/i/annotationInterfaces'
import type {MetaAnnotation} from 'reactive-di/i/plugins/metaInterfaces' // eslint-disable-line

export function meta(...deps: Array<Dependency>): MetaAnnotation {
    return {
        kind: 'meta',
        id: '',
        deps
    }
}
