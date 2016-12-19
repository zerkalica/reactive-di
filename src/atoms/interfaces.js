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

export type IHasForceUpdate = {
    forceUpdate(): void;
}

export interface IBaseHook<V> {
    dispose?: (v: V) => void;
    init?: (v: V) => void;
    shouldUpdate?: (next: V, prev: V) => boolean;

    willMount?: (v: V) => void;
    willUnmount?: (v: V) => void;
    willUpdate?: (next: V, prev: ?V) => void;
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
    willUnmount(): void;
    willMount(): void;
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
    create(updater: IHasForceUpdate, props: Props): IConsumerListener<Props, Element, Component>;
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
    create(updater: IHasForceUpdate): IConsumerListener<Props, Element, Component>;
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

    refs: number;
    context: IContext;
    masters: IMaster[];

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
    loaded: boolean;
}

type IStatusBase = {
    complete: boolean;
    pending: boolean;
    error: ?Error;
}
export interface ISourceStatus extends IStatusBase {
    isEqual(src: ISourceStatus): boolean;
    copy(opts: $Shape<IStatusBase>): ISourceStatus;
}

export type IDepInfo<V> = {
    displayName: string;
    id: number;
    cached: ?V;
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
    setter: ?ISetter<V>;
    getSetter(): ISetter<V>;
    eventSetter: ?ISetter<V>;
    getEventSetter(): ISetter<V>;

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

export type INotifier = {
    notify(c: IPullable<*>[], flush?: boolean): void;
    commit(): void;
}

export type ICreateElement<Element> = (...args: any) => Element

export type IComponent<Props, State, Element> = (props: Props, state: State) => Element

export interface IComponentFactory<Component, Element> {
    createElement: ICreateElement<Element>;

    wrapComponent<Props, State>(
        factory: IConsumerFactory<Props, Element>
    ): Component;
}

export interface IErrorHandler {
    setError(e: Error): void;
}

export type IMiddlewares = {
    onSetValue<V>(src: IDepInfo<V>, newVal: V): void;
    onMethodCall<O: Object>(name: string, prop: string, args: mixed[], result: mixed): void;
    onFuncCall(name: string, args: mixed[], result: mixed): void;
}

export type IStaticContext<Component, Element> = {
    binder: IRelationBinder;
    depFactory: IDepFactory<Element>;
    notifier: INotifier;
    componentFactory: IComponentFactory<*, *>;
    errorHandler: IErrorHandler;
    protoFactory: ?IContext;
    middlewares: ?IMiddlewares;
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
    errorHandler: IErrorHandler;
    protoFactory: ?IContext;
    binder: IRelationBinder;
    notifier: INotifier;
    middlewares: ?IMiddlewares;
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
