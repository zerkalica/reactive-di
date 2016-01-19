/* @flow */

import CacheImpl from './impl/CacheImpl'
import EntityMetaImpl from './impl/EntityMetaImpl'
import ModelImpl from './impl/ModelDepImpl'
import {HooksImpl} from '../annotations/annotationImpl'
import type {Info, Hooks} from '../annotations/annotationInterfaces'
import type {
    Cache,
    FactoryDep,
    ModelDep,
    ClassDep,
    AnyDep,
    IEntityMeta
} from './nodeInterfaces'

import type {DepId} from '../interfaces'

export {ModelImpl}

export class ClassDepImpl<T> {
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

    constructor(
        id: DepId,
        info: Info,
        proto: Class<T>,
        hooks: ?Hooks<T>
    ) {
        this.kind = 'class'
        this.id = id
        this.cache = new CacheImpl()
        this.info = info
        this.hooks = hooks || new HooksImpl()
        this.proto = proto
        this.relations = []
    }
}

export class FactoryDepImpl<T> {
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

    constructor(
        id: DepId,
        info: Info,
        fn: Function,
        hooks: ?Hooks<T>
    ) {
        this.kind = 'factory'
        this.id = id
        this.cache = new CacheImpl()
        this.info = info
        this.hooks = hooks || new HooksImpl()
        this.fn = fn
        this.relations = []
    }
}

export class MetaDepImpl {
    kind: 'meta';
    id: DepId;
    cache: Cache<IEntityMeta>;
    info: Info;
    relations: Array<AnyDep>;
    sources: Array<ModelDep>;

    constructor(id: DepId, info: Info) {
        this.kind = 'meta'
        this.id = id
        this.cache = new CacheImpl(new EntityMetaImpl())
        this.info = info
        this.relations = []
    }
}

export class SetterDepImpl<T, V> {
    kind: 'setter';
    id: DepId;
    cache: Cache<V>;
    info: Info;
    relations: Array<AnyDep>;
    facet: FactoryDep<T>;
    set: (v: T|Promise<T>) => void;

    constructor(id: DepId, info: Info) {
        this.kind = 'setter'
        this.id = id
        this.cache = new CacheImpl()
        this.info = info
        this.relations = []
    }
}
