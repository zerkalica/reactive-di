/* @flow */
import type {
    DepId,
    DepFn,
    Info,
    AsyncResult,
    SetterResult,
    Hooks,
    HooksRec
} from '../annotations/annotationInterfaces'
import type {
    Observer,
    Observable,
    Subscription
} from '../observableInterfaces'
import type {
    Cacheable,
    MetaSource,
    AsyncUpdater,
    DepBase,
    DepArgs,
    Invoker,
    AnyDep,

    ModelDep,
    AsyncModelDep,

    ClassDep,
    ClassInvoker,
    FactoryDep,
    FactoryInvoker,

    AsyncSetter,
    SetterDep,
    SetterInvoker,

    LoaderDep,
    LoaderInvoker,

    EntityMeta
} from './nodeInterfaces'

import type {FromJS, Cursor, Notifier} from '../modelInterfaces'
import EntityMetaImpl from './impl/EntityMetaImpl'
import AsyncUpdaterImpl from './impl/AsyncUpdaterImpl'

// implements DepBase
class DepBaseImpl<V> {
    isRecalculate: boolean;
    value: V;
    relations: Array<DepId>;
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

// implements DepArgs
export class DepArgsImpl<M> {
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<M>;

    constructor(
        deps: Array<AnyDep>,
        depNames: ?Array<string>,
        middlewares: ?Array<M>
    ) {
        this.deps = deps
        this.depNames = depNames
        this.middlewares = middlewares
    }
}

function defaultFn(): void {}

// implements Hooks
class HooksImpl<T> {
    onUnmount: () => void;
    onMount: () => void;
    onUpdate: (currentValue: T, nextValue: T) => void;

    constructor(r?: HooksRec<T> = {}) {
        this.onMount = r.onMount || defaultFn
        this.onUnmount = r.onUnmount || defaultFn
        this.onUpdate = r.onUpdate || defaultFn
    }
}

// implements Invoker
class InvokerImpl<V, T, M> {
    hooks: Hooks<V>;
    target: T;
    depArgs: DepArgs<M>;

    constructor(target: T, hooks: ?Hooks<V>, middlewares: ?Array<M>) {
        this.target = target
        this.hooks = hooks || new HooksImpl()
    }
}

// implements ModelDep
export class ModelDepImpl<V: Object> {
    kind: 'model';
    base: DepBase<V>;

    fromJS: FromJS<V>;
    dataOwners: Array<Cacheable>;
    get: () => V;

    set: (value: V) => void;

    constructor(
        id: DepId,
        info: Info,
        value: V,
        cursor: Cursor<V>,
        fromJS: FromJS<V>,
        notifier: Notifier
    ) {
        this.kind = 'model'
        const base = this.base = new DepBaseImpl(id, info, value)

        this.fromJS = fromJS
        const dataOwners = this.dataOwners = []
        this.get = cursor.get

        this.set = function set(value: V): void {
            if (cursor.set(value)) {
                base.value = value
                for (let i = 0, l = dataOwners.length; i < l; i++) {
                    dataOwners[i].isRecalculate = true
                }
                notifier.notify()
            }
        }
    }
}

// implements AsyncModelDep
export class AsyncModelDepImpl<V: Object, E> {
    kind: 'asyncmodel';
    base: DepBase<V>;

    fromJS: FromJS<V>;
    dataOwners: Array<Cacheable>;
    get: () => V;

    updater: AsyncUpdater<V, E>;
    meta: EntityMeta<E>;
    metaOwners: Array<Cacheable>;

    constructor(
        id: DepId,
        info: Info,
        value: V,
        cursor: Cursor<V>,
        fromJS: FromJS<V>,
        notifier: Notifier
    ) {
        this.kind = 'asyncmodel'
        this.base = new DepBaseImpl(id, info, value)

        this.fromJS = fromJS
        this.dataOwners = []
        this.get = cursor.get

        this.meta = new EntityMetaImpl()
        this.metaOwners = []

        this.updater = new AsyncUpdaterImpl(
            cursor,
            notifier,
            this.base,
            (this: MetaSource<E>),
            this.dataOwners,
            this.metaOwners
        )
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
    base: DepBase<SetterResult<V, E>>;
    invoker: SetterInvoker<V, E>;
    set: AsyncSetter<V, E>;

    constructor(
        id: DepId,
        info: Info,
        target: DepFn<SetterResult<V, E>|DepFn<V>>
    ) {
        this.kind = 'setter'
        this.base = new DepBaseImpl(id, info)
        this.invoker = new InvokerImpl(target)
    }
}

// implements LoaderDep
export class LoaderDepImpl<V: Object, E> {
    kind: 'loader';
    base: DepBase<AsyncResult<V, E>>;
    invoker: LoaderInvoker<V, E>;
    set: AsyncSetter<V, E>;

    constructor(
        id: DepId,
        info: Info,
        target: DepFn<AsyncResult<V, E>>
    ) {
        this.kind = 'loader'
        this.base = new DepBaseImpl(id, info)
        this.invoker = new InvokerImpl(target)
    }
}
