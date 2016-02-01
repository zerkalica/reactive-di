/* @flow */

import type {
    DepFn,
    AnnotationBase,
    Dependency
} from '../../interfaces/annotationInterfaces'
import type {FromJS} from '../../interfaces/modelInterfaces'
import type {
    DepBase,
    Cacheable
} from '../../interfaces/nodeInterfaces'
import type {Observable} from '../../interfaces/observableInterfaces'
import type {FactoryDep} from '../factory/factoryInterfaces'
import type {ModelInfo} from '../model/modelInterfaces'

export type Loader<V: Object, E> = DepFn<Observable<V, E>>;

export type EntityMeta<E> = {
    pending: boolean;
    rejected: boolean;
    fulfilled: boolean;
    reason: ?E;
}

export type AsyncModelAnnotation<V: Object, E> = {
    kind: 'asyncmodel';
    base: AnnotationBase<Class<V>>;
    info: ModelInfo<V>;
    loader: ?Loader<V, E>;
}

export type AsyncModelDep<V: Object, E> = {
    kind: 'asyncmodel';
    base: DepBase;
    resolve(): V;
    setFromJS(value: Object): void;
    dataOwners: Array<Cacheable>;

    meta: EntityMeta<E>;
    set(value: Observable<V, E>): void;
    unsubscribe(): void;
    metaOwners: Array<Cacheable>;
}

export type MetaSource<E> = {
    meta: EntityMeta<E>;
    metaOwners: Array<Cacheable>;
}
