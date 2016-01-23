/* @flow */

import {HooksImpl} from '../annotations/annotationImpl'
import type {
    DepId,
    Loader,
    DepFn,
    Info,
    Hooks
} from '../annotations/annotationInterfaces'
import type {
    Observer,
    Observable,
    Subscription
} from '../observableInterfaces'
import type {
    Cacheable,
    MetaSource,
    DepBase,
    AnyDep,

    ModelDep,
    AsyncModelDep,

    ClassDep,
    ClassInvoker,
    FactoryDep,
    FactoryInvoker,

    PromiseSetter,
    SetterDep,
    SetterInvoker,
    SetterResult,

    LoaderDep,
    LoaderInvoker,
    LoaderResult,

    EntityMeta
} from './nodeInterfaces'

import type {FromJS, Cursor} from '../modelInterfaces'
import EntityMetaImpl from './impl/EntityMetaImpl'

// implements DepBase
class DepBaseImpl<V> {
    isRecalculate: boolean;
    value: V;
    relations: Array<Cacheable>;
    id: DepId;
    info: Info;

    constructor(
        id: DepId,
        info: Info,
        value?: V
    ) {
        this.id = id
        this.info = info
        this.isRecalculate = value === undefined
        this.relations = []
        if (value !== undefined) {
            this.value = value
        }
    }
}

// implements Invoker
class InvokerImpl<V, T, M> {
    hooks: Hooks<V>;
    target: T;
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<M>;

    constructor(target: T, hooks: ?Hooks<V>, middlewares: ?Array<M>) {
        this.deps = []
        this.target = target
        this.hooks = hooks || new HooksImpl()
        this.middlewares = middlewares
    }
}

// implements ModelDep
export default class ModelDepImpl<V: Object> {
    kind: 'model';
    base: DepBase<V>;
    fromJS: FromJS<V>;
    cursor: Cursor<V>;

    constructor(
        id: DepId,
        info: Info,
        value: V
    ) {
        this.kind = 'model'
        this.base = new DepBaseImpl(id, info, value)
    }
}

// implements AsyncModelDep
export default class AsyncModelDepImpl<V: Object, E> {
    kind: 'asyncmodel';
    base: DepBase<V>;
    meta: EntityMeta<E>;
    asyncRelations: Array<Cacheable>;

    fromJS: FromJS<V>;
    cursor: Cursor<V>;

    constructor(
        id: DepId,
        info: Info,
        value: V
    ) {
        this.kind = 'asyncmodel'
        this.base = new DepBaseImpl(id, info, value)
        this.meta = new EntityMetaImpl()
        this.asyncRelations = []
    }
}

// implements ClassDep
export class ClassDepImpl<V: Object> {
    kind: 'class';
    base: DepBase<V>;
    invoker: ClassInvoker<V>;

    constructor(
        id: DepId,
        info: Info,
        target: Class<V>
    ) {
        this.kind = 'class'
        this.base = new DepBaseImpl(id, info)
        this.invoker = new InvokerImpl(target)
    }
}

// implements FactoryDep
export class FactoryDepImpl<V: any, E> {
    kind: 'factory';
    base: DepBase<V>;
    invoker: FactoryInvoker<V>;

    constructor(
        id: DepId,
        info: Info,
        target: DepFn<V>
    ) {
        this.kind = 'factory'
        this.base = new DepBaseImpl(id, info)
        this.invoker = new InvokerImpl(target)
    }
}

// implements MetaDep
export class MetaDepImpl<E> {
    kind: 'meta';
    base: DepBase<EntityMeta<E>>;
    sources: Array<MetaSource>;

    constructor(
        id: DepId,
        info: Info
    ) {
        this.kind = 'meta'
        this.base = new DepBaseImpl(id, info)
        this.sources = []
    }
}

// implements SetterDep
export class SetterDepImpl<V: Object, E> {
    kind: 'setter';
    base: DepBase<SetterResult<V>>;
    invoker: SetterInvoker<V>;

    set: PromiseSetter<V>;

    constructor(
        id: DepId,
        info: Info,
        target: DepFn<SetterResult<V>>
    ) {
        this.kind = 'setter'
        this.base = new DepBaseImpl(id, info)
        this.invoker = new InvokerImpl(target)
    }
}

const defaultSubscription: Subscription = {
    unsubscribe(): void {}
}

// implements LoaderDep
export class LoaderDepImpl<V: Object, E> {
    kind: 'loader';
    base: DepBase<LoaderResult<V, E>>;
    invoker: LoaderInvoker<V, E>;

    modelObserver: Observer<V, E>;
    lastSubscription: Subscription;
    refCount: number;

    constructor(
        id: DepId,
        info: Info,
        target: DepFn<LoaderResult<V, E>>
    ) {
        this.kind = 'loader'
        this.base = new DepBaseImpl(id, info)
        this.invoker = new InvokerImpl(target)
        this.lastSubscription = defaultSubscription
        this.refCount = 0
    }
}
