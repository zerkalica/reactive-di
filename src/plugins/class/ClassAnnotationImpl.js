/* @flow */

import {AnnotationBaseImpl} from '../../core/pluginImpls'
import type {AnnotationBase, DepFn} from '../../interfaces/annotationInterfaces'
import type {Deps} from '../../interfaces/annotationInterfaces'
import type {ClassAnnotation} from './classInterfaces'

// implements ClassAnnotation
export default class ClassAnnotationImpl<V: Object> {
    kind: 'class';
    base: AnnotationBase<Class<V>>;
    deps: ?Deps;

    constructor(target: Class<V>, deps: ?Deps, tags: Array<string>) {
        this.kind = 'class'
        this.base = new AnnotationBaseImpl(this.kind, tags, target)
        this.deps = deps
    }
}
