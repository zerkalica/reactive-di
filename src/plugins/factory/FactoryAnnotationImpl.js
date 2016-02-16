/* @flow */

import {AnnotationBaseImpl} from '../../core/pluginImpls'
import type {
    Deps,
    DepId,
    AnnotationBase,
    DepFn
} from '../../interfaces/annotationInterfaces'
import type {FactoryAnnotation} from './factoryInterfaces' // eslint-disable-line

// implements FactoryAnnotation
export default class FactoryAnnotationImpl<V> {
    kind: 'factory';
    base: AnnotationBase<DepFn<V>>;
    deps: ?Deps;

    constructor(
        id: DepId,
        target: DepFn<V>,
        deps: ?Deps,
        tags: Array<string>
    ) {
        this.kind = 'factory'
        this.base = new AnnotationBaseImpl(id, this.kind, tags, target)
        this.deps = deps
    }
}
