/* @flow */

import type {
    DepId,
    AnnotationBase
} from 'reactive-di/i/annotationInterfaces'
import {AnnotationBaseImpl} from 'reactive-di/core/pluginImpls'
import type {AsyncModelAnnotation} from 'reactive-di/plugins/asyncmodel/asyncmodelInterfaces' // eslint-disable-line
import type {ModelInfo} from 'reactive-di/plugins/model/modelInterfaces'
import ModelInfoImpl from 'reactive-di/plugins/model/ModelInfoImpl'

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
