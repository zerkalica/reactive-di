/* @flow */

import type {AnnotationBase} from '../../interfaces/annotationInterfaces'
import {AnnotationBaseImpl} from '../../core/pluginImpls'
import type {
    AsyncModelAnnotation,
    Loader
} from './asyncmodelInterfaces'
import type {ModelInfo} from '../model/modelInterfaces'
import ModelInfoImpl from '../model/ModelInfoImpl'

// implements AsyncModelAnnotation
export default class AsyncModelAnnotationImpl<V: Object, E> {
    kind: 'asyncmodel';
    base: AnnotationBase<Class<V>>;
    info: ModelInfo<V>;
    loader: ?Loader<V, E>;

    constructor(
        target: Class<V>,
        tags: Array<string>,
        loader?: ?Loader<V, E>
    ) {
        this.kind = 'asyncmodel'
        this.base = new AnnotationBaseImpl(this.kind, tags, target)
        this.info = new ModelInfoImpl()
        this.loader = loader || null
    }
}
