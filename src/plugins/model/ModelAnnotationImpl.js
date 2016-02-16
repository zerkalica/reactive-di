/* @flow */

import ModelInfoImpl from '~/plugins/model/ModelInfoImpl'
import {AnnotationBaseImpl} from '~/core/pluginImpls'
import type {
    DepId,
    AnnotationBase
} from 'reactive-di/i/annotationInterfaces'
import type {
    ModelInfo,
    ModelAnnotation // eslint-disable-line
} from '~/plugins/model/modelInterfaces'

// implements ModelAnnotation
export default class ModelAnnotationImpl<V: Object> {
    kind: 'model';
    base: AnnotationBase<Class<V>>; // eslint-disable-line
    info: ModelInfo<V>;

    constructor(
        id: DepId,
        target: Class<V>, // eslint-disable-line
        tags: Array<string>
    ) {
        this.kind = 'model'
        this.base = new AnnotationBaseImpl(id, this.kind, tags, target)
        this.info = new ModelInfoImpl()
    }
}
