/* @flow */

import CacheImpl from './impl/CacheImpl'
import EntityMetaImpl from './impl/EntityMetaImpl'
import ModelDepImpl from './impl/ModelDepImpl'
import DepBaseImpl from './impl/DepBaseImpl'
import {HooksImpl} from '../annotations/annotationImpl'
import type {
    DepId,
    DepFn,
    Info,
    Hooks
} from '../annotations/annotationInterfaces'
import type {
    DepBase,
    FactoryDep,
    ModelDep,
    ClassDep,
    AnyDep,
    EntityMeta
} from './nodeInterfaces'

import type {Observable} from '../observableInterfaces'

export {ModelDepImpl}

// implements ClassDep
export class ClassDepImpl<V, E> {
    kind: 'class';
    id: DepId;
    base: DepBase<V, E>;

    hooks: Hooks<V>;
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<ClassDep>;
    /* eslint-disable no-undef */
    proto: Class<V>;
    /* eslint-enable no-undef */

    constructor(
        id: DepId,
        info: Info,
        /* eslint-disable no-undef */
        proto: Class<V>,
        /* eslint-enable no-undef */
        hooks: ?Hooks<V>
    ) {
        this.kind = 'class'
        this.id = id
        this.base = new DepBaseImpl(info)
        this.hooks = hooks || new HooksImpl()
        this.proto = proto
    }
}

// implements FactoryDep
export class FactoryDepImpl<V, E> {
    kind: 'factory';
    id: DepId;
    base: DepBase<V, E>;

    hooks: Hooks<V>;
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<FactoryDep>;
    fn: DepFn<V>;

    constructor(
        id: DepId,
        info: Info,
        fn: DepFn<V>,
        hooks: ?Hooks<V>
    ) {
        this.kind = 'factory'
        this.id = id
        this.base = new DepBaseImpl(info)
        this.hooks = hooks || new HooksImpl()
        this.fn = fn
    }
}

export class MetaDepImpl<E> {
    kind: 'meta';
    id: DepId;
    base: DepBase<EntityMeta<E>, E>;

    source: AnyDep;

    constructor(id: DepId, info: Info) {
        this.kind = 'meta'
        this.id = id
        this.base = new DepBaseImpl(info)
        this.base.value = new EntityMetaImpl()
    }
}

export class SetterDepImpl<V, E> {
    kind: 'setter';
    id: DepId;
    base: DepBase<V, E>;

    hooks: Hooks<V>;
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<FactoryDep>;
    fn: DepFn<V>;

    set: (v: V|Promise<V>) => void;

    constructor(id: DepId, info: Info) {
        this.kind = 'setter'
        this.id = id
        this.base = new DepBaseImpl(info)
    }
}

export class LoaderDep<V, E> {
    kind: 'loader';
    id: DepId;
    base: DepBase<Observable<V, E>, E>;

    hooks: Hooks<Observable<V, E>>;
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<FactoryDep>;
    fn: DepFn<Observable<V, E>>;

    constructor(
        id: DepId,
        info: Info,
        fn: DepFn<V>,
        hooks: ?Hooks<V>
    ) {
        this.kind = 'loader'
        this.id = id
        this.base = new DepBaseImpl(info)
        this.hooks = hooks || new HooksImpl()
        this.fn = fn
    }
}
