/* @flow */

import type {
    AnnotationBase,
    Dependency
} from '../../interfaces/annotationInterfaces'
import type {FromJS} from '../../interfaces/modelInterfaces'
import type {
    DepBase,
    Cacheable
} from '../../interfaces/nodeInterfaces'
import type {AsyncModelDep} from '../asyncmodel/asyncmodelInterfaces'

export type ModelInfo<V> = {
    childs: Array<Dependency>;
    statePath: Array<string>;
    fromJS: FromJS<V>;
}

export type ModelAnnotation<V: Object> = {
    kind: 'model';
    base: AnnotationBase<Class<V>>;
    info: ModelInfo<V>;
}

export type ModelDep<V: Object> = {
    kind: 'model';
    base: DepBase;
    resolve(): V;
    setFromJS(value: Object): void;
    set(value: V): void;
    dataOwners: Array<Cacheable>;
}
