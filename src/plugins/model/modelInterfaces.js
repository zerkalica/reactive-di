/* @flow */

import type {
    DepFn,
    AnnotationBase,
    Dependency
} from '../../annotationInterfaces'
import type {FromJS} from '../../modelInterfaces'
import type {
    DepBase,
    Cacheable
} from '../../nodeInterfaces'
import type {Observable} from '../../observableInterfaces'
import type {FactoryDep} from '../factory/factoryInterfaces'

export type Loader<V: Object, E> = DepFn<Observable<V, E>>;

export type EntityMeta<E> = {
    pending: boolean;
    rejected: boolean;
    fulfilled: boolean;
    reason: ?E;
}

export type AsyncUpdater<V: Object, E> = {
    meta: EntityMeta<E>;
    metaOwners: Array<Cacheable>;
    subscribe: (value: Observable<V, E>) => void;
    unsubscribe: () => void;
    isSubscribed: boolean;
}

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

export type AsyncModelAnnotation<V: Object, E> = {
    kind: 'asyncmodel';
    base: AnnotationBase<Class<V>>;
    info: ModelInfo<V>;
    loader: ?Loader<V, E>;
}

export type ModelDep<V: Object, E> = {
    kind: 'model';
    base: DepBase<V>;

    fromJS: FromJS<V>;
    dataOwners: Array<Cacheable>;
    get: () => V;
    set: (value: V) => void;

    updater: ?AsyncUpdater<V, E>;
    loader: ?FactoryDep<Observable<V, E>>;
}

export type MetaSource<E> = {
    meta: EntityMeta<E>;
}
