// @flow

/* eslint-disable */

export const setterKey = Symbol('rdi:setter')

export type IKey = Function

export type IGetable<V> = {
    cached: ?V;
    get(): V;
}

type ValuesRec = {k: string, v: IGetable<*>}

export type IArg = {
    t: 0;
    v: IGetable<*>;
} | {
    t: 1;
    r: ValuesRec[];
}

export type ISettable<V> = {
    merge(props: mixed, flush?: boolean): void;
    set(v: V, flush?: boolean): void;
}

export type IGettable<V> = {
    get(): V;
}

export type IHasForceUpdate<Props> = {
    forceUpdate(): void;
    setProps(props: Props): void;
}

export interface IBaseHook<V> {
    dispose?: (v: V) => void;
    init?: (v: V) => void;
    shouldUpdate?: (next: V, prev: V) => boolean;

    willMount?: (v: V) => void;
    willUnmount?: (v: V) => void;
    willUpdate?: (next: V, prev: ?V) => void;
    didDepsUpdate?: () => void;
}

export type IConsumerHook<Props: Object> = {
    willUnmount?: (p: Props) => void;
    willMount?: (p: Props) => void;
    willUpdate?: (next: Props, prev: ?Props) => void;

    didMount?: (p: Props) => void;
    didUpdate?: (p: Props) => void;
}

export type IDepRegister = Function | [IKey, Function]

export type IMaster = IComputed<*> | ISource<*>

export type IRawArg = (Function | {[id: string]: Function})

export type IBaseMeta = {
    key: IKey;
    id: number;
    name: string;
}

export type IConsumerMeta = IBaseMeta & {
    args: ?IRawArg[];
    hook: ?IKey;
    errorComponent: ?IKey;
    register: ?IDepRegister[];
}

export type Component = any

export type IConsumerListener<Props, Element, Component> = {
    displayName: string;
    closed: boolean;
    props: Props;
    willUnmount(): void;
    willMount(prop: Props): void;
    didMount(): void;
    render(): Element;
    shouldUpdate(newProps: Props): boolean;
    didUpdate(): void;
}

export type IConsumerFactory<Props, Element> = {
    displayName: string;
    id: number;
    component: Component;
    context: IContext;
    create(updater: IHasForceUpdate<Props>): IConsumerListener<Props, Element, Component>;
}

type State = any
export type IConsumer<Props, Element> = {
    t: 2;
    displayName: string;

    id: number;
    closed: boolean;
    context: IContext;
    masters: IMaster[];

    cached: ?State;
    pull(): void;
    dispose(): void;
    create(updater: IHasForceUpdate<Props>): IConsumerListener<Props, Element, Component>;
}

export type IStatusMeta = IBaseMeta & {
    statuses: IRawArg[];
}

export type IStatus = {
    t: 3;
    displayName: string;
    id: number;
    closed: boolean;
    context: IContext;
    masters: IMaster[];
    cached: ?ISourceStatus;
    get(): ISourceStatus;
    resolve(): void;
}

export type IComputedMeta = IBaseMeta & {
    args: ?IRawArg[];
    ender: boolean;
    hook: ?IKey;
    func: boolean;
}

export type IComputed<V> = {
    t: 0;
    displayName: string;
    id: number;
    closed: boolean;

    isHook: boolean;
    pull(): void;

    refs: number;
    context: IContext;
    masters: IMaster[];
    notifier: INotifier;

    cached: ?V;
    get(): V;
    resolve(): void;
    willMount(parent: ?IContext): void;
    willUnmount(parent: ?IContext): void;
}

export type ISourceMeta<V> = IBaseMeta & {
    hook: ?IKey;
    initialValue: V;
    configValue: ?V;
    isFetching: boolean;
    isPending: boolean;
}

type IStatusBase = {
    complete: boolean;
    pending: boolean;
    error: ?Error;
}

export type SourceStatusOpts = {
    complete?: boolean;
    pending?: boolean;
    error?: ?Error;
}

export type ISourceStatus = IStatusBase & {
    isEqual(src: ISourceStatus): boolean;
    copy(opts: SourceStatusOpts): ISourceStatus;
}

export type ISetter<V> = {[id: string]: (v: mixed) => void}

export type ISource<V> = {
    t: 1;
    displayName: string;
    id: number;
    cached: ?V;
    refs: number;
    context: IContext;

    status: ?ISource<ISourceStatus>;
    getStatus(): ISource<ISourceStatus>;

    computeds: IDisposableCollection<IDisposable & ICacheable<*>>;
    consumers: IDisposableCollection<IPullable<*>>;

    get(): V;
    set(v: V): void;
    merge(props: mixed, flush?: boolean): void;
    resolve(): void;
    willMount(parent: ?IContext): void;
    willUnmount(parent: ?IContext): void;
}

export type IParent<V, Element> = IConsumer<V, Element> | IComputed<V> | IStatus

export interface IRelationItem {
    has: boolean[];
    v: IParent<*, *>;
    ender: boolean;
}

export interface IRelationBinder {
    stack: IRelationItem[];
    level: number;

    debugStr(sub: ?mixed): string;
    begin(dep: IParent<*, *>, isEnder: boolean): void;
    end(): void;
}


export type IDepInfo<V> = {
    displayName: string;
    cached: ?V;
}

export type ICallerInfo<V> = {
    trace: string;
    modelName: string;
    oldValue: ?V;
    newValue: V;
    asyncType: null | 'next' | 'error' | 'complete';
    callerId: number;
}

export type ILogger = {
    onError(error: Error, name: string): void;
    onSetValue<V>(info: ICallerInfo<V>): void;
}

export type INotifier = {
    trace: string;
    callerId: number;
    asyncType: null | 'next' | 'error' | 'complete';

    lastId: number;
    logger: ?IComputed<ILogger>;

    end(): void;
    onError(e: Error, name: string): void;
    notify<V>(c: IPullable<*>[], name: string, oldValue: V, newValue: V): void;
}

export type ICreateElement<Element> = (...args: any) => Element

export type IComponent<Props, State, Element> = (props: Props, state: State) => Element

export interface IComponentFactory<Component, Element> {
    createElement: ICreateElement<Element>;

    wrapComponent<Props: Object, State>(
        factory: IConsumerFactory<Props, Element>
    ): Component;
}

export type IStaticContext<Component, Element> = {
    binder: IRelationBinder;
    depFactory: IDepFactory<Element>;
    notifier: INotifier;
    componentFactory: IComponentFactory<*, *>;
    protoFactory: ?IContext;
    contexts: ?IDisposableCollection<IContext>;
}

export type IHasDispose = {
    closed: boolean;
    dispose(): void;
}

export type ICacheItem = {
    id: number;
    context: IContext;
}

export type IContext = {
    items: ICacheItem[];
    componentFactory: IComponentFactory<Component, *>;
    protoFactory: ?IContext;
    binder: IRelationBinder;
    notifier: INotifier;
    closed: boolean;
    disposables: IDisposableCollection<IHasDispose>;

    set<V>(id: number, v: V): boolean;
    dispose(): void;
    copy(name: string): IContext;
    register(deps?: ?IDepRegister[]): IContext;

    resolveHook<V>(key: ?IKey): IComputed<V>;
    resolveConsumer<V: Object>(key: IKey): IConsumerFactory<V, *>;
    resolveSource<V>(key: IKey): ISource<V>;
    resolveDeps(args: IRawArg[]): IArg[];
    wrapComponent<Props, State>(component: IComponent<Props, State, *>): Component;
}

export type IDepFactory<Element> = {
    consumer<V>(key: Function, context: IContext): IConsumerFactory<V, Element>;
    computed<V>(key: Function, context: IContext): IComputed<V>;
    hook<V>(key: Function, context: IContext): IComputed<V>;
    source<V>(key: Function, context: IContext): ISource<V>;
    status(key: Function, context: IContext): IStatus;
    anyDep<V>(key: Function, context: IContext): ISource<V> | IComputed<V> | IStatus;
    any<V>(key: Function, context: IContext): ISource<V> | IComputed<V> | IStatus | IConsumerFactory<V, Element>;
}

export type ICacheable<V> = {
    cached: ?V;
}

export type IPullable<V> = {
    pull(): void;
    closed: boolean;
    cached: ?V;
}

export type IDisposable = {
    closed: boolean;
}

export interface IDisposableCollection<V: IDisposable> {
    items: V[];
    push(v: V): void;
    gc(): void;
}

export type ISetError = (e: Error) => void

export type IComponentWrapper<RdiComponent, NativeComponent> = {
    wrap(src: RdiComponent): NativeComponent;
    setError(e: Error): void;
}

export type IHasCreateComponent<Element> = {
    h(
        tag: any,
        props?: ?{[id: string]: mixed}
    ): Element;
}

export type ResultOf<F> = _ResultOf<*, F>
type _ResultOf<V, F: (...x: any[]) => V> = V // eslint-disable-line
