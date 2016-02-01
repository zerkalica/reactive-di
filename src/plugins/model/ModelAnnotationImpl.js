/* @flow */

import type {AnnotationBase} from '../../interfaces/annotationInterfaces'
import {AnnotationBaseImpl} from '../../core/pluginImpls'
import type {
    ModelInfo,
    ModelAnnotation
} from './modelInterfaces'
import ModelInfoImpl from './ModelInfoImpl'

// implements ModelAnnotation
export default class ModelAnnotationImpl<V: Object> {
    kind: 'model';
    base: AnnotationBase<Class<V>>;
    info: ModelInfo<V>;

    constructor(target: Class<V>, tags: Array<string>) {
        this.kind = 'model'
        this.base = new AnnotationBaseImpl(this.kind, tags, target)
        this.info = new ModelInfoImpl()
    }
}
