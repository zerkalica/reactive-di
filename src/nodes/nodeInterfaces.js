/* @flow */
import type {Hooks, Info} from '../annotations/annotationInterfaces'
import type {DepId} from '../interfaces'

export type IEntityMeta = {
    pending: boolean;
    rejected: boolean;
    fulfilled: boolean;
    needFetch: boolean;
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

export type ModelDep<T: Object> = {
    kind: 'model';
    id: DepId;
    meta: IEntityMeta;
    cache: Cache<T>;
    info: Info;
    relations: Array<AnyDep>;
    childs: Array<ModelDep>;
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
    cache: Cache<IEntityMeta>;
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

export type Processor = {
    resolve<T: AnyDep, V: any>(rec: T): V;
}

export type ProcessorType<T: AnyDep> = (rec: T, dep: Processor) => void;
export type ProcessorTypeMap = {[kind: string]: ProcessorType};
