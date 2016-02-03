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

export type AsyncUpdater<V: Object, E> = (model: V, ...x: any) => Observable<V, E>;
export type SyncUpdater<V: Object> = (model: V, ...x: any) => V;
export type AnyUpdater<V: Object, E> = AsyncUpdater<V, E> | SyncUpdater<V>;

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
}

export type AsyncModelDep<V: Object, E> = {
    kind: 'asyncmodel';
    base: DepBase;
    resolve(): V;
    setFromJS(value: Object): void;
    dataOwners: Array<Cacheable>;

    meta: EntityMeta<E>;
    promise: Promise<any>;
    set(value: V|Observable<V, E>): void;
    unsubscribe(): void;
    metaOwners: Array<Cacheable>;
}

export type MetaSource<E> = {
    meta: EntityMeta<E>;
    promise: Promise<any>;
    metaOwners: Array<Cacheable>;
}
