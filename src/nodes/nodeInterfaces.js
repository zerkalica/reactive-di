/* @flow */

/* eslint-disable no-unused-vars */

import type {
    Hooks,
    Info,
    Dependency,
    DepId,
    DepFn,
    Loader,
    SetterResult,
    Setter
} from '../annotations/annotationInterfaces'
import type {FromJS, SimpleMap, Cursor} from '../modelInterfaces'
import type {Subscription, Observer, Observable} from '../observableInterfaces'

export type EntityMeta<E> = {
    pending: boolean;
    rejected: boolean;
    fulfilled: boolean;
    reason: ?E;
}

export type MetaSource<E> = {
    meta: EntityMeta<E>;
}

/* eslint-disable no-use-before-define, no-undef */

export type Cacheable = {
    isRecalculate: boolean;
};

export type DepBase<V> = {
    isRecalculate: boolean;
    value: V;
    relations: Array<DepId>;
    id: DepId;
    info: Info;
    subscriptions: Array<Subscription>;
}

export type AsyncUpdater<V: Object, E> = {
    meta: EntityMeta<E>;
    metaOwners: Array<Cacheable>;
    subscribe: (value: Observable<V, E>) => void;
    unsubscribe: () => void;
    isSubscribed: boolean;
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

export type DepArgs<M> = {
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<M>;
}

export type Invoker<V, M> = {
    target: V;
    depArgs: DepArgs<M>;
}

export type ClassInvoker<V> = Invoker<Class<V>, ClassDep>;
export type ClassDep<V: Object> = {
    kind: 'class';
    base: DepBase<V>;
    invoker: ClassInvoker<V>;
}

export type FactoryInvoker<V> = Invoker<DepFn<V>, FactoryDep>;
export type FactoryDep<V: any> = {
    kind: 'factory';
    base: DepBase<V>;
    invoker: FactoryInvoker<V>;
}

export type MetaDep<E> = {
    kind: 'meta';
    base: DepBase<EntityMeta<E>>;
    sources: Array<AsyncUpdater>;
}

export type SetterInvoker<V> = Invoker<DepFn<Setter<V>>, FactoryDep>;
export type SetterDep<V: Object, E> = {
    kind: 'setter';
    base: DepBase<Setter<V>>;
    invoker: SetterInvoker<V>;
    set: (value: V|Observable<V, E>) => void;
}

export type AnyDep =
    ModelDep
    | FactoryDep
    | ClassDep
    | MetaDep
    | SetterDep;

export type DepSubscriber = {
    subscribe(dep: AnyDep): Subscription;
}

export type Notifier = {
    notify(): void;
}

export type DepProcessor = {
    resolve(dep: AnyDep): any;
}

export type ProcessorType = (rec: AnyDep, dep: DepProcessor) => void;
export type ProcessorTypeMap = SimpleMap<string, ProcessorType>;
