/* @flow */

import {AnnotationBaseImpl} from '../../annotations/annotationImpl'
import type {AnnotationBase, DepFn} from '../../annotationInterfaces'
import type {Deps} from '../factory/factoryInterfaces'
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
