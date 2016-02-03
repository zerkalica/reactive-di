/* @flow */

import {AnnotationBaseImpl} from '../../core/pluginImpls'
import type {
    DepId,
    AnnotationBase
} from '../../interfaces/annotationInterfaces'
import type {AsyncUpdater} from '../asyncmodel/asyncmodelInterfaces'
import type {LoaderAnnotation} from './loaderInterfaces'

// implements LoaderAnnotation
export default class LoaderAnnotationImpl<V: Object, E> {
    kind: 'loader';
    base: AnnotationBase<AsyncUpdater<V, E>>;
    setter: AsyncUpdater<V, E>;

    constructor(
        id: DepId,
        setter: AsyncUpdater<V, E>,
        model: Class<V>,
        tags: Array<string>
    ) {
        this.kind = 'loader'
        this.base = new AnnotationBaseImpl(id, this.kind, tags, model)
        this.setter = setter
    }
}
