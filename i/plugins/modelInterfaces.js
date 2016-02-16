/* @flow */

import type {
    AnnotationBase,
    Dependency
} from 'reactive-di/i/annotationInterfaces'
import type {FromJS} from 'reactive-di/i/modelInterfaces'
import type {
    DepBase,
    Cacheable
} from 'reactive-di/i/nodeInterfaces'

export type ModelInfo<V> = {
    childs: Array<Dependency>;
    statePath: Array<string>;
    fromJS: FromJS<V>;
}

export type ModelAnnotation<V: Object> = {
    kind: 'model';
    base: AnnotationBase<Class<V>>; // eslint-disable-line
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
