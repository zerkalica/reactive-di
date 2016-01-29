/* @flow */

import type {
    Deps,
    AnnotationBase,
    DepFn
} from '../../annotationInterfaces'
import {AnnotationBaseImpl} from '../../core/pluginImpls'
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
