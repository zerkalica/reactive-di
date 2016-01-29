/* @flow */

import {AnnotationBaseImpl} from '../../annotations/annotationImpl'
import type {
    AnnotationBase,
    DepFn
} from '../../annotationInterfaces'
import type {
    Deps,
    FactoryAnnotation
} from './factoryInterfaces'

// implements FactoryAnnotation
export default class FactoryAnnotationImpl<V> {
    kind: 'factory';
    base: AnnotationBase<DepFn<V>>;
    deps: ?Deps;

    constructor(target: DepFn<V>, deps: ?Deps, tags: Array<string>) {
        this.kind = 'factory'
        this.base = new AnnotationBaseImpl(this.kind, tags, target)
        this.deps = deps
    }
}
