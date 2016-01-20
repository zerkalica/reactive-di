/* @flow */

/* eslint-disable no-unused-vars */
import type {
    Hooks,
    Info,
    Dependency,
    DepId,
    DepFn
} from '../annotations/annotationInterfaces'

export type EntityMeta = {
    pending: boolean;
    rejected: boolean;
    fulfilled: boolean;
    needFetch: boolean;
    reason: ?Error;
}

export type FromJS<T: Object> = (data: Object) => T;

/* eslint-disable no-use-before-define, no-undef */

export type Cache<T> = {
    isRecalculate: boolean;
    value: T;
    meta: EntityMeta;
}

export type Cursor<T: Object> = {
    get(): T;
    set(v: T): boolean;
}

export type ModelDep<T> = {
    kind: 'model';
    id: DepId;
    meta: EntityMeta;
    cache: Cache<T>;
    info: Info;
    relations: Array<AnyDep>;
    childs: Array<ModelDep>;
    fromJS: FromJS<T>;
    set: (value: T|Promise<T>) => void;
    get: () => T;
}

export type ClassDep<T> = {
    kind: 'class';
    id: DepId;
    cache: Cache<T>;
    info: Info;
    relations: Array<AnyDep>;
    hooks: Hooks<T>;
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<ClassDep>;
    proto: Class<T>;
}

export type FactoryDep<A, T: DepFn<A>> = {
    kind: 'factory';
    id: DepId;
    cache: Cache<A>;
    info: Info;
    relations: Array<AnyDep>;
    hooks: Hooks<A>;
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<FactoryDep>;
    fn: T;
}

export type MetaDep = {
    kind: 'meta';
    id: DepId;
    cache: Cache<EntityMeta>;
    info: Info;
    relations: Array<AnyDep>;
    sources: Array<ModelDep>;
}

export type SetterDep<A, T: DepFn<A>> = {
    kind: 'setter';
    id: DepId;
    cache: Cache<A>;
    info: Info;
    relations: Array<AnyDep>;
    facet: FactoryDep<A, T>;
    set(v: A|Promise<A>): void;
}

export type AnyDep<A, T: Dependency<A>> = ClassDep<A>
    | ModelDep<A>
    | FactoryDep<A, T>
    | MetaDep
    | SetterDep<A, T>;

export type Notifier = {
    notify(): void;
}

export type DepProcessor = {
    resolve<A: any, B: Dependency<A>, T: AnyDep<A, B>>(dep: T): A;
}

export type ProcessorType<A: any, B: Dependency<A>, T: AnyDep<A, B>> = (rec: T, dep: DepProcessor) => void;
export type ProcessorTypeMap = {[kind: string]: ProcessorType};
