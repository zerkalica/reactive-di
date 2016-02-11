/* @flow */

import {AnnotationBaseImpl} from '../../core/pluginImpls'
import type {
    DepId,
    AnnotationBase
} from '../../interfaces/annotationInterfaces'
import type {AsyncUpdater} from '../asyncmodel/asyncmodelInterfaces'
import type {ResetAnnotation} from './loaderInterfaces' // eslint-disable-line

// implements ResetAnnotation
export default class ResetAnnotationImpl<V: Object, E> {
    kind: 'reset';
    base: AnnotationBase<AsyncUpdater<V, E>>;

    constructor(
        id: DepId,
        target: AsyncUpdater<V, E>,
        tags: Array<string>
    ) {
        this.kind = 'reset'
        this.base = new AnnotationBaseImpl(id, this.kind, tags, target)
    }
}
