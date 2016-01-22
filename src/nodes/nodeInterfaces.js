/* @flow */

/* eslint-disable no-unused-vars */
import type {
    SimpleMap,
    Hooks,
    Info,
    Dependency,
    DepId,
    DepFn
} from '../annotations/annotationInterfaces'

import type {Subscription, Observable} from '../observableInterfaces'

export type EntityMeta<E> = {
    pending: boolean;
    rejected: boolean;
    fulfilled: boolean;
    reason: ?E;
}

/* eslint-disable no-use-before-define, no-undef */

export type Cursor<V> = {
    get(): V;
    set(value: V): boolean;
}

export type ModelState<V, E> = {
    pending(): void;
    success(value: V): void;
    error(error: E): void;
}

export type Updater<V, E> = {
    meta: EntityMeta<E>;
    isDirty: boolean;
    observable: ?Observable<V, E>;
    loader: LoaderDep<V, E>;
    subscription: Subscription;
}

export type DepBase<V, E> = {
    isRecalculate: boolean;
    value: V;
    info: Info;
    relations: Array<AnyDep>;
    meta: EntityMeta<E>;
}

export type ModelDep<V, E> = {
    kind: 'model';
    id: DepId;
    base: DepBase<V, E>;

    childs: Array<ModelDep>;
    state: ModelState<V, E>;
    updater: ?Updater<V, E>;
    fromJS: FromJS<V>;
    get(): V;
}

export type ClassDep<V, E> = {
    kind: 'class';
    id: DepId;
    base: DepBase<V, E>;

    hooks: Hooks<V>;
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<ClassDep>;
    proto: Class<V>;
}

export type FactoryDep<V, E> = {
    kind: 'factory';
    id: DepId;
    base: DepBase<V, E>;

    hooks: Hooks<V>;
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<FactoryDep>;
    fn: DepFn<V>;
}

export type LoaderDep<V, E> = {
    kind: 'loader';
    id: DepId;
    base: DepBase<Observable<V, E>, E>;

    hooks: Hooks<Observable<V, E>>;
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<FactoryDep>;
    fn: DepFn<Observable<V, E>>;
}

export type MetaDep<E> = {
    kind: 'meta';
    id: DepId;
    base: DepBase<EntityMeta<E>, E>;

    source: AnyDep;
}

export type SetterDep<V, E> = {
    kind: 'setter';
    id: DepId;
    base: DepBase<V, E>;

    hooks: Hooks<V>;
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<FactoryDep>;
    fn: DepFn<V>;

    set(v: V|Promise<V>): void;
}

export type AnyDep<V, E> =
    ClassDep<V, E>
    | ModelDep<V, E>
    | FactoryDep<V, E>
    | LoaderDep<V, E>
    | MetaDep<E>
    | SetterDep<V, E>;

export type Notifier = {
    notify(): void;
}

export type DepProcessor = {
    resolve<V: any, E>(dep: AnyDep<V, E>): V;
}

export type ProcessorType<V: any, E> = (rec: AnyDep<V, E>, dep: DepProcessor) => void;
export type ProcessorTypeMap = SimpleMap<string, ProcessorType>;
