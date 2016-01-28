/* @flow */
import type {
    DepId,
    DepFn,
    Info,
    Loader,

    SetterResult,
    Setter,

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

    ClassDep,
    ClassInvoker,
    FactoryDep,
    FactoryInvoker,

    SetterDep,
    SetterInvoker,

    EntityMeta
} from './nodeInterfaces'

import type {FromJS, Cursor, Notifier} from '../modelInterfaces'
import EntityMetaImpl from './impl/EntityMetaImpl'
import AsyncUpdaterImpl from './impl/AsyncUpdaterImpl'

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

// implements SetterDep
export class SetterDepImpl<V: Object, E> {
    kind: 'setter';
    base: DepBase<Setter<V>>;
    invoker: SetterInvoker<V>;
    set: (value: V|Observable<V, E>) => void;

    constructor(
        id: DepId,
        info: Info,
        target: DepFn<Setter<V>>,
        set: (value: V|Observable<V, E>) => void
    ) {
        this.kind = 'setter'
        this.base = new DepBaseImpl(id, info)
        this.invoker = new InvokerImpl(target)
        this.set = set
    }
}
