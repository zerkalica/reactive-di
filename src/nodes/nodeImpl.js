/* @flow */

import CacheImpl from './impl/CacheImpl'
import EntityMetaImpl from './impl/EntityMetaImpl'
import ModelDepImpl from './impl/ModelDepImpl'
import {HooksImpl} from '../annotations/annotationImpl'
import type {DepId, Info, Hooks} from '../annotations/annotationInterfaces'
import type {
    Cache,
    FactoryDep,
    ModelDep,
    ClassDep,
    AnyDep,
    EntityMeta
} from './nodeInterfaces'

export {ModelDepImpl}

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
    /* eslint-disable no-undef */
    proto: Class<T>;
    /* eslint-enable no-undef */

    constructor(
        id: DepId,
        info: Info,
        /* eslint-disable no-undef */
        proto: Class<T>,
        /* eslint-enable no-undef */
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
    cache: Cache<EntityMeta>;
    info: Info;
    relations: Array<AnyDep>;
    source: AnyDep;

    constructor(id: DepId, info: Info) {
        this.kind = 'meta'
        this.id = id
        this.cache = new CacheImpl()
        this.cache.value = new EntityMetaImpl()
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
