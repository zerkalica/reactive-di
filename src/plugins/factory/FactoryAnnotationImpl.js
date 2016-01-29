/* @flow */

import type {
    Deps,
    AnnotationBase,
    DepFn
} from '../../annotationInterfaces'
import {AnnotationBaseImpl} from '../../core/pluginImpls'
import type {FactoryAnnotation} from './factoryInterfaces'

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
