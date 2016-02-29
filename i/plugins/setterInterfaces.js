/* @flow */

import type {
    Deps,
    DepItem,
    DepAnnotation
} from 'reactive-di/i/annotationInterfaces'
import type {
    EntityMeta,
    DepBase,
    Cacheable
} from 'reactive-di/i/nodeInterfaces'
import type {ModelDep} from 'reactive-di/i/plugins/modelInterfaces'

export type SetFn = (...args: any) => void;

export type PromiseSource = {
    promise: Promise<void>;
    base: DepBase;
}

export type AsyncResult<V: Object, E> =
    [V, Promise<V>|Observable<V, E>]
    | Promise<V>|Observable<V, E>;

export type SyncSetterDep = {
    kind: 'syncsetter';
    base: DepBase;
    resolve(): SetFn;
}

export type AsyncSetterDep<E> = {
    kind: 'asyncsetter';
    base: DepBase;

    meta: EntityMeta<E>;
    promise: Promise<void>;
    metaOwners: Array<Cacheable>;
    childSetters: Array<PromiseSource>;
    reset(): void;
    resolve(): SetFn;
}

export type AsyncUpdater<V: Object, E> = (model: V, ...x: Array<any>) => AsyncResult<V, E>;
export type SyncUpdater<V: Object> = (model: V, ...x: Array<any>) => V;

export type SyncSetterAnnotation<V: Object> = DepAnnotation<SyncUpdater<V>> & {
    kind: 'syncsetter';
    model: Class<V>;
}

export type AsyncSetterAnnotation<V: Object, E> = DepAnnotation<AsyncUpdater<V, E>> & {
    kind: 'asyncsetter';
    model: Class<V>;
}
