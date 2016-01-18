/* @flow */
import type {Hooks, Info} from '../annotations/annotationInterfaces'

export type IEntityMeta = {
    pending: boolean;
    rejected: boolean;
    fulfilled: boolean;
    reason: ?Error;
}

/* eslint-disable no-use-before-define, no-undef */

export type Cache<T> = {
    isRecalculate: boolean;
    value: ?T;
}

export type Cursor<T> = {
    get(): T;
    set(v: T|Promise<T>): void;
}

export const KIND_MODEL = 1
export type ModelDep<T: Object> = {
    kind: 1; // 'model';
    meta: IEntityMeta;
    cache: Cache<T>;
    info: Info;
    relations: Array<AnyDep>;
    childs: Array<ModelDep>;
    set: (value: T|Promise<T>) => void;
    get: () => T;
}

export const KIND_CLASS = 2
export type ClassDep<T: Object> = {
    kind: 2; // 'klass';
    cache: Cache<T>;
    info: Info;
    hooks: Hooks<T>;
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<ClassDep>;
    proto: Class<T>;
}

export const KIND_FACTORY = 3
export type FactoryDep<T: any> = {
    kind: 3; // 'factory';
    cache: Cache<T>;
    info: Info;
    hooks: Hooks<T>;
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<FactoryDep>;
    fn: Function;
}

export const KIND_META = 4
export type MetaDep = {
    kind: 4; // 'meta';
    cache: Cache<IEntityMeta>;
    info: Info;
    sources: Array<ModelDep>;
}

export const KIND_SETTER = 5
export type SetterDep<T: Function, V> = {
    kind: 5; // 'setter';
    cache: Cache<V>;
    info: Info;
    facet: FactoryDep<T>;
    set(v: T|Promise<T>): void;
}

export type AnyDep = ClassDep | ModelDep | FactoryDep | MetaDep | SetterDep;

/* eslint-enable no-use-before-define, no-undef */
