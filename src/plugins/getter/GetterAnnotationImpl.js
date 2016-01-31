/* @flow */

import type {AnnotationBase, Dependency} from '../../interfaces/annotationInterfaces'
import {AnnotationBaseImpl} from '../../core/pluginImpls'
import type {GetterAnnotation} from './getterInterfaces'

// implements GetterAnnotation
export default class GetterAnnotationImpl<V> {
    kind: 'getter';
    base: AnnotationBase<Dependency<V>>;

    constructor(target: Dependency, tags: Array<string>) {
        this.kind = 'getter'
        this.base = new AnnotationBaseImpl(this.kind, tags, target)
    }
}
