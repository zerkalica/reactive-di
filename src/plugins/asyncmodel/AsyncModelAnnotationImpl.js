/* @flow */

import type {
    DepId,
    AnnotationBase
} from '../../interfaces/annotationInterfaces'
import {AnnotationBaseImpl} from '../../core/pluginImpls'
import type {AsyncModelAnnotation} from './asyncmodelInterfaces'
import type {ModelInfo} from '../model/modelInterfaces'
import ModelInfoImpl from '../model/ModelInfoImpl'

// implements AsyncModelAnnotation
export default class AsyncModelAnnotationImpl<V: Object, E> {
    kind: 'asyncmodel';
    base: AnnotationBase<Class<V>>;
    info: ModelInfo<V>;

    constructor(
        id: DepId,
        target: Class<V>,
        tags: Array<string>
    ) {
        this.kind = 'asyncmodel'
        this.base = new AnnotationBaseImpl(id, this.kind, tags, target)
        this.info = new ModelInfoImpl()
    }
}
