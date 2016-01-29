/* @flow */

import {AnnotationBaseImpl} from '../../annotations/annotationImpl'
import type {
    AnnotationBase,
    DepFn
} from '../../annotationInterfaces'
import type {Deps} from '../factory/factoryInterfaces'
import type {Loader} from '../model/modelInterfaces'
import type {LoaderAnnotation} from './loaderInterfaces'

// implements LoaderAnnotation
export class LoaderAnnotationImpl<V: Object, E> {
    kind: 'loader';
    base: AnnotationBase<Loader<V, E>>;
    deps: ?Deps;

    constructor(
        target: Loader<V, E>,
        deps: ?Deps,
        tags: Array<string>
    ) {
        this.kind = 'loader'
        this.base = new AnnotationBaseImpl(this.kind, tags, target)
        this.deps = deps
    }
}
