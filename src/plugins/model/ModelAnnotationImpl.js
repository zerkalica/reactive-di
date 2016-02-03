/* @flow */

import ModelInfoImpl from './ModelInfoImpl'
import {AnnotationBaseImpl} from '../../core/pluginImpls'
import type {
    DepId,
    AnnotationBase
} from '../../interfaces/annotationInterfaces'
import type {
    ModelInfo,
    ModelAnnotation
} from './modelInterfaces'

// implements ModelAnnotation
export default class ModelAnnotationImpl<V: Object> {
    kind: 'model';
    base: AnnotationBase<Class<V>>;
    info: ModelInfo<V>;

    constructor(id: DepId, target: Class<V>, tags: Array<string>) {
        this.kind = 'model'
        this.base = new AnnotationBaseImpl(id, this.kind, tags, target)
        this.info = new ModelInfoImpl()
    }
}
