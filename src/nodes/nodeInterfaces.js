/* @flow */
import type {Hooks, Info, DepId} from '../annotations/annotationInterfaces'

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
    value: ?T;
}

export type Cursor<T: Object> = {
    get(): T;
    set(v: T): boolean;
}

export type ModelDep<T: Object> = {
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

export type ClassDep<T: Object> = {
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

export type FactoryDep<T> = {
    kind: 'factory';
    id: DepId;
    cache: Cache<T>;
    info: Info;
    relations: Array<AnyDep>;
    hooks: Hooks<T>;
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<FactoryDep>;
    fn: Function;
}

export type MetaDep = {
    kind: 'meta';
    id: DepId;
    cache: Cache<EntityMeta>;
    info: Info;
    relations: Array<AnyDep>;
    sources: Array<ModelDep>;
}

export type SetterDep<T: Function, V> = {
    kind: 'setter';
    id: DepId;
    cache: Cache<V>;
    info: Info;
    relations: Array<AnyDep>;
    facet: FactoryDep<T>;
    set(v: T|Promise<T>): void;
}

export type AnyDep = ClassDep | ModelDep | FactoryDep | MetaDep | SetterDep;

export type Notifier = {
    notify(): void;
}

export type DepProcessor = {
    resolve<T: AnyDep, V: any>(rec: T): V;
}

export type ProcessorType<T: AnyDep> = (rec: T, dep: DepProcessor) => void;
export type ProcessorTypeMap = {[kind: string]: ProcessorType};
