/* @flow */

import {AnnotationBaseImpl} from '../../annotations/annotationImpl'
import type {AnnotationBase, Dependency} from '../../annotations/annotationInterfaces'
import type {MetaAnnotation} from './metaInterfaces'

// implements MetaAnnotation
export default class MetaAnnotationImpl<V> {
    kind: 'meta';
    base: AnnotationBase<Dependency<V>>;

    constructor(target: Dependency, tags: Array<string>) {
        this.kind = 'meta'
        this.base = new AnnotationBaseImpl(this.kind, tags, target)
    }
}
