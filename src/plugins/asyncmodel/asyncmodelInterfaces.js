/* @flow */

import type {
    AnnotationBase
} from 'reactive-di/i/annotationInterfaces'
import type {
    DepBase,
    Cacheable
} from 'reactive-di/i/nodeInterfaces'
import type {ModelInfo} from '~/plugins/model/modelInterfaces'

export type AsyncUpdater<V: Object, E> = (model: V, ...x: any) => Observable<V, E>;
export type SyncUpdater<V: Object> = (model: V, ...x: any) => V;
export type AnyUpdater<V: Object, E> = AsyncUpdater<V, E> | SyncUpdater<V>;

export type EntityMeta<E> = {
    pending: boolean;
    rejected: boolean;
    fulfilled: boolean;
    reason: ?E;
}

export type AsyncModelAnnotation<V: Object> = {
    kind: 'asyncmodel';
    base: AnnotationBase<Class<V>>; // eslint-disable-line
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

    metaOwners: Array<Cacheable>;
    reset(): void;
    pending(): void;
    next(value: V): void;
    error(err: E): void;
}

export type MetaSource<E> = {
    meta: EntityMeta<E>;
    promise: Promise<any>;
    metaOwners: Array<Cacheable>;
}
