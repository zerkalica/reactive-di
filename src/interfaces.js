// @flow

export interface SrcComponent<Props, State> extends React$Component<void, Props, State> {
    static constructor(state: State): SrcComponent<Props, State>;
    props: Props;
    state: State;
    $: HTMLElement;

    render(): any;
    componentDidMount: () => void;
    componentDidUpdate: (nextProps: Props, nextState: State) => void;
    componentWillUnmount: () => void;
}

export type StyleSheet = {
    attach(): void;
    detach(): void;
    classes: {[id: string]: string};
}

export interface RawStyleSheet {
    __css: ?{[id: string]: Object};
    __styles: StyleSheet;
}

export type CreateStyleSheet = (css: {[id: string]: Object}) => StyleSheet;
export type CreateThemesReactor = (unmounted: Derivable<boolean>) => void;

export type CreateWidget<Props, State, Component> = (
    Target: Class<SrcComponent<Props, State>>,
    atom: Derivable<*>,
    createReactor: CreateThemesReactor
) => Component

export interface LifeCycle {
    until?: Derivable<boolean>;
    onStart?: () => void;
    onStop?: () => void;
}

export interface Reactor<T> {
    start(): void;
    stop(): void;
}

export interface Derivable<V> {
    get(): V;
    derive<E>(f: (value: V) => E): Derivable<E>;
    react(fn: (v: V) => void, lc?: ?LifeCycle): void;
}

export interface Atom<V> extends Derivable<V> {
    set(v: V): void;
}

export type Result<V> = Derivable<V>|Atom<V>
export type DerivableDict = {[id: string]: Derivable<*>}
export type DerivableArg = any

export interface Adapter {
    isAtom(v: mixed): boolean;
    atom<V>(value: V): Atom<V>;
    atomFromObservable<V>(value: V, observable: (Promise<V> | Observable<V, Error>)): Atom<V>;
    struct<R>(value: DerivableArg[]): Derivable<R>;
}

export type Key = Function|string

export type DepFn<V> = (...a: any) => V
export type DepDict = {[k: string]: Key}
export type ArgDep = Key | DepDict

export type DepAlias = [Key, Key]
export type RegisterDepItem = DepAlias | Key
export type InitData<V> = [V, ?(Promise<V> | Observable<V, Error>)]
export type Initializer<V> = DepFn<InitData<V>>
