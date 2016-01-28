/* @flow */

import {AnnotationBaseImpl} from '../../annotations/annotationImpl'
import type {AnnotationBase, Dependency} from '../../annotations/annotationInterfaces'
import type {
    FromJS
} from '../../modelInterfaces'
import type {
    ModelInfo,
    ModelAnnotation,
    Loader
} from './modelInterfaces'

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
export class ModelAnnotationImpl<V: Object> {
    kind: 'model';
    base: AnnotationBase<Class<V>>;
    info: ModelInfo<V>;

    constructor(target: Class<V>, tags: Array<string>) {
        this.kind = 'model'
        this.base = new AnnotationBaseImpl(this.kind, tags, target)
        this.info = new ModelInfoImpl()
    }
}

// implements AsyncModelAnnotation
export class AsyncModelAnnotationImpl<V: Object, E> {
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
