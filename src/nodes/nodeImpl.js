/* @flow */

import ModelImpl from './impl/ModelDepImpl'
import CacheImpl from './impl/CacheImpl'
import type {Info, Hooks} from '../annotations/annotationInterfaces'
import {HooksImpl} from '../annotations/annotationImpl'

import type {
    Cache,
    FactoryDep,
    ModelDep,
    ClassDep,
    AnyDep
} from './nodeInterfaces'

export {ModelImpl}

export class ClassDepImpl<T> {
    kind: 2; // 'klass';
    cache: Cache<T>;
    info: Info;
    hooks: Hooks<T>;
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<ClassDep>;
    proto: Class<T>;

    constructor(info: Info, deps: Array<AnyDep>, depNames: ?Array<string>, proto: Class<T>, hooks: ?Hooks<T>, middlewares: ?Array<ClassDep>) {
        this.kind = 2
        this.cache = new CacheImpl()
        this.info = info
        this.hooks = hooks || new HooksImpl()
        this.deps = deps
        this.depNames = depNames
        this.proto = proto
        this.middlewares = middlewares
    }
}

export class FactoryDepImpl<T> {
    kind: 3; // 'factory';
    cache: Cache<T>;
    info: Info;
    hooks: Hooks<T>;
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<FactoryDep>;
    fn: Function;

    constructor(info: Info, deps: Array<AnyDep>, depNames: ?Array<string>, fn: Function, hooks: ?Hooks<T>, middlewares: ?Array<FactoryDep>) {
        this.kind = 3
        this.cache = new CacheImpl()
        this.info = info
        this.hooks = hooks || new HooksImpl()
        this.deps = deps
        this.depNames = depNames
        this.fn = fn
        this.middlewares = middlewares
    }
}

export class MetaDepImpl<T> {
    kind: 4; // 'meta';
    cache: Cache<T>;
    info: Info;
    sources: Array<ModelDep>;

    constructor(info: Info, sources: Array<ModelDep>) {
        this.kind = 4
        this.cache = new CacheImpl()
        this.info = info
        this.sources = sources
    }
}

export class SetterDepImpl<T, V> {
    kind: 5; // 'setter';
    cache: Cache<V>;
    info: Info;
    facet: FactoryDep<T>;
    set: (v: T|Promise<T>) => void;

    constructor(info: Info, facet: FactoryDep<T>, set: (v: T|Promise<T>) => void) {
        this.kind = 5
        this.cache = new CacheImpl()
        this.info = info
        this.facet = facet
        this.set = set
    }
}
