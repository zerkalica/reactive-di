/* @flow */

import {AnnotationBaseImpl} from 'reactive-di/pluginsCommon/pluginImpls'
import type {
    DepId,
    AnnotationBase,
    Dependency
} from 'reactive-di/i/annotationInterfaces'
import type {
    ModelInfo,
    ModelAnnotation // eslint-disable-line
} from 'reactive-di/i/plugins/modelInterfaces'
import type {FromJS} from 'reactive-di/i/modelInterfaces'

// implements ModelInfo
class ModelInfoImpl<V> {
    childs: Array<Dependency>;
    statePath: Array<string>;
    fromJS: FromJS<V>;

    constructor() {
        this.childs = []
        this.statePath = []
    }
}

// implements ModelAnnotation
export default class ModelAnnotationImpl<V: Object> {
    kind: 'model';
    base: AnnotationBase<Class<V>>;
    info: ModelInfo<V>;

    constructor(
        id: DepId,
        target: Class<V>,
        tags: Array<string>
    ) {
        this.kind = 'model'
        this.base = new AnnotationBaseImpl(id, this.kind, tags, target)
        this.info = new ModelInfoImpl()
    }
}
