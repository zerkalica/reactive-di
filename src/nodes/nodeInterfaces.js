/* @flow */

/* eslint-disable no-unused-vars */

import type {
    Hooks,
    Info,
    Dependency,
    DepId,
    DepFn,
    Loader
} from '../annotations/annotationInterfaces'
import type {FromJS, SimpleMap} from '../modelInterfaces'
import type {Subscription, Observable} from '../observableInterfaces'

export type EntityMeta<E> = {
    pending: boolean;
    rejected: boolean;
    fulfilled: boolean;
    reason: ?E;
}

export type MetaProvider<E> = {
    meta: EntityMeta<E>;
}
/* eslint-disable no-use-before-define, no-undef */

export type DepBase<V: any, E> = {
    id: DepId;

    displayName: string;
    tags: Array<string>;
    relations: Array<AnyDep>;

    isRecalculate: boolean;
    value: V;
    meta: EntityMeta<E>;
}

export type ModelDep<V: Object, E> = DepBase<V, E> & {
    kind: 'model';
    metaSources: Array<MetaProvider>;
    fromJS: FromJS<V>;
    get(): V;
    set(value: V): boolean;
}

export type Updater<V: Object, E> = {
    meta: EntityMeta<E>;
    isDirty: boolean;
    observable: ?Observable<V, E>;
    loader: LoaderDep<V, E>;
    subscription: Subscription;
    refCount: number;
}

export type AsyncModelDep<V: Object, E> = DepBase<V, E> & {
    kind: 'asyncmodel';
    updater: Updater<V, E>;
    model: ModelDep<V: Object, E>;
}

export type ClassDep<V: Object, E> = {
    kind: 'class';
    id: DepId;
    base: DepBase<V, E>;

    hooks: Hooks<V>;
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<ClassDep>;
    proto: Class<V>;
}

export type FactoryDep<V: any, E> = {
    kind: 'factory';
    id: DepId;
    base: DepBase<V, E>;

    hooks: Hooks<V>;
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<FactoryDep>;
    fn: DepFn<V>;
}

export type LoaderDep<V: Object, E> = {
    kind: 'loader';
    id: DepId;
    base: DepBase<V, E>;

    hooks: Hooks<V>;
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<FactoryDep>;
    fn: DepFn<V>;
}

export type MetaDep<V: EntityMeta, E> = {
    kind: 'meta';
    id: DepId;
    base: DepBase<V, E>;

    source: AnyDep;
}

export type SetterDep<V: Object, E> = {
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

export type SubscribableDep<V: any, E> =
    ClassDep<V, E>
    | FactoryDep<V, E>;

export type MiddlewarableDep<V: any, E> =
    ClassDep<V, E>
    | FactoryDep<V, E>
    | SetterDep<V, E>
    | LoaderDep<V, E>;

export type AnyDep<V: any, E> =
    ClassDep<V, E>
    | ModelDep<V, E>
    | FactoryDep<V, E>
    | LoaderDep<V, E>
    | MetaDep<V, E>
    | SetterDep<V, E>;

export type DepSubscriber = {
    subscribe(dep: SubscribableDep): Subscription;
}
export type Notifier = {
    notify(): void;
}

export type DepProcessor = {
    resolve<V: any, E>(dep: AnyDep<V, E>): V;
}

export type ProcessorType<V: any, E> = (rec: AnyDep<V, E>, dep: DepProcessor) => void;
export type ProcessorTypeMap = SimpleMap<string, ProcessorType>;
