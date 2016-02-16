/* @flow */

import type {
    DepId,
    AnnotationBase,
    Dependency
} from 'reactive-di/i/annotationInterfaces'
import {AnnotationBaseImpl} from 'reactive-di/core/pluginImpls'
import type {MetaAnnotation} from 'reactive-di/plugins/meta/metaInterfaces' // eslint-disable-line

// implements MetaAnnotation
export default class MetaAnnotationImpl<V> {
    kind: 'meta';
    base: AnnotationBase<Dependency<V>>;

    constructor(id: DepId, target: Dependency, tags: Array<string>) {
        this.kind = 'meta'
        this.base = new AnnotationBaseImpl(id, this.kind, tags, target)
    }
}
