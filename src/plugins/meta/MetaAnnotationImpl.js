/* @flow */

import type {
    DepId,
    AnnotationBase,
    Dependency
} from '../../interfaces/annotationInterfaces'
import {AnnotationBaseImpl} from '../../core/pluginImpls'
import type {MetaAnnotation} from './metaInterfaces'

// implements MetaAnnotation
export default class MetaAnnotationImpl<V> {
    kind: 'meta';
    base: AnnotationBase<Dependency<V>>;

    constructor(id: DepId, target: Dependency, tags: Array<string>) {
        this.kind = 'meta'
        this.base = new AnnotationBaseImpl(id, this.kind, tags, target)
    }
}
