/* @flow */

import type {
    DepId,
    AnnotationBase
} from '../../interfaces/annotationInterfaces'
import {AnnotationBaseImpl} from '../../core/pluginImpls'
import type {AsyncModelAnnotation} from './asyncmodelInterfaces' // eslint-disable-line
import type {ModelInfo} from '../model/modelInterfaces'
import ModelInfoImpl from '../model/ModelInfoImpl'

// implements AsyncModelAnnotation
export default class AsyncModelAnnotationImpl<V: Object> {
    kind: 'asyncmodel';
    base: AnnotationBase<Class<V>>; // eslint-disable-line
    info: ModelInfo<V>;

    constructor(
        id: DepId,
        target: Class<V>, // eslint-disable-line
        tags: Array<string>
    ) {
        this.kind = 'asyncmodel'
        this.base = new AnnotationBaseImpl(id, this.kind, tags, target)
        this.info = new ModelInfoImpl()
    }
}
