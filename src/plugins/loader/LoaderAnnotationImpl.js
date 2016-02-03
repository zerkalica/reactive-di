/* @flow */

import {AnnotationBaseImpl} from '../../core/pluginImpls'
import type {
    DepId,
    AnnotationBase,
    Deps
} from '../../interfaces/annotationInterfaces'
import type {AsyncUpdater} from '../asyncmodel/asyncmodelInterfaces'
import type {LoaderAnnotation} from './loaderInterfaces'

// implements LoaderAnnotation
export default class LoaderAnnotationImpl<V: Object, E> {
    kind: 'loader';
    base: AnnotationBase<AsyncUpdater<V, E>>;
    model: Class<V>;
    deps: ?Deps;

    constructor(
        id: DepId,
        target: AsyncUpdater<V, E>,
        model: Class<V>,
        deps: ?Deps,
        tags: Array<string>
    ) {
        this.kind = 'loader'
        this.base = new AnnotationBaseImpl(id, this.kind, tags, target)
        this.model = model
        this.deps = deps
    }
}
