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
    relations: Array<Cacheable>;
    id: DepId;
    info: Info;
}

export type ModelDep<V: Object> = {
    kind: 'model';
    base: DepBase<V>;
    fromJS: FromJS<V>;
    cursor: Cursor<V>;
}

export type AsyncModelDep<V: Object, E> = {
    kind: 'asyncmodel';
    base: DepBase<V>;

    fromJS: FromJS<V>;
    cursor: Cursor<V>;

    meta: EntityMeta<E>;
    asyncRelations: Array<Cacheable>;
}

export type Invoker<V, T, M> = {
    hooks: Hooks<V>;
    target: T;
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<M>;
}

export type ClassInvoker<V> = Invoker<V, Class<V>, ClassDep>;
export type ClassDep<V: Object> = {
    kind: 'class';
    base: DepBase<V>;
    invoker: ClassInvoker<V>;
}

export type FactoryInvoker<V> = Invoker<V, DepFn<V>, FactoryDep>;
export type FactoryDep<V: any> = {
    kind: 'factory';
    base: DepBase<V>;
    invoker: FactoryInvoker<V>;
}

export type MetaDep<E> = {
    kind: 'meta';
    base: DepBase<EntityMeta<E>>;
    sources: Array<MetaSource>;
}

export type SetterResultValue<V> = Promise<V>|V;
export type SetterResult<V> = DepFn<SetterResultValue<V>>;
export type SetterInvoker<V> = Invoker<SetterResult<V>, DepFn<SetterResult<V>>, FactoryDep>;
export type PromiseSetter<V> = (result: SetterResultValue<V>) => void;
export type SetterDep<V: Object, E> = {
    kind: 'setter';
    base: DepBase<SetterResult<V>>;
    invoker: SetterInvoker<V>;
    set: PromiseSetter<V>;
}

export type LoaderResult<V: Object, E> = Observable<V, E>|Promise<V>;
export type LoaderInvoker<V, E> = Invoker<LoaderResult<V, E>, DepFn<LoaderResult<V, E>>, FactoryDep>;
export type LoaderDep<V: Object, E> = {
    kind: 'loader';
    base: DepBase<LoaderResult<V, E>>;
    invoker: LoaderInvoker<V, E>;
    modelObserver: Observer<V, E>;
    lastSubscription: Subscription;
    refCount: number;
}

export type AnyDep =
    ModelDep
    | FactoryDep
    | ClassDep
    | MetaDep
    | SetterDep
    | LoaderDep;

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
