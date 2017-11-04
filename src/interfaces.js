// @flow

export type TypedPropertyDescriptor<T> = {
    enumerable?: boolean;
    configurable?: boolean;
    writable?: boolean;
    value?: T;
    initializer?: () => T;
    get?: () => T;
    set?: (value: T | Error) => void;
}

export const ATOM_FORCE_NONE = 0
export const ATOM_FORCE_CACHE = 1
export const ATOM_FORCE_UPDATE = 2
export type IAtomForce = typeof ATOM_FORCE_CACHE | typeof ATOM_FORCE_UPDATE | typeof ATOM_FORCE_NONE
export type IAtomPropHandler<V> = (next?: V | Error, force?: IAtomForce, oldValue?: V) => V
export type DetachedDecoratorDescriptor<V> = TypedPropertyDescriptor<IAtomPropHandler<V>>
export type DetachedDecorator<P: Object, V> = (
    proto: P,
    name: string,
    descr: DetachedDecoratorDescriptor<V>
) => DetachedDecoratorDescriptor<V>

export const renderedKey = Symbol('lom_rendered')
export const diKey = Symbol('rdi_di')

export type IArg = Function | {+[id: string]: Function}
export type IProvideItem = Function | Object | [Function | string, Function | mixed]

export type IPropsWithContext = {
    [id: string]: any;
    __lom_ctx?: Object;
}

export interface ISheet<V: Object> {
    attach(): any;
    classes: {+[id: $Keys<V>]: string};
}

export type IProcessor = {
    createStyleSheet<V: Object>(cssObj: V, options: any): ISheet<V>;
    removeStyleSheet<V: Object>(sheet: ISheet<V>): void;
}

export type IDisposableSheet<V: Object> = {
    [id: $Keys<V>]: string;
    destructor?: () => void;
}

export interface ISheetManager {
    sheet<V: Object>(key: string, css: V, memoized: boolean): IDisposableSheet<V>;
}

export type IReactComponent<IElement> = {
    constructor(props: IPropsWithContext, context?: Object): IReactComponent<IElement>;
    render(): IElement;
    forceUpdate(): void;
}

export type IFromError<IElement> = (props: {error: Error}, state?: any) => IElement

export interface IRenderFn<IElement, State> {
    (props: IPropsWithContext, state?: State): IElement;
    __lom?: Class<IReactComponent<IElement>>;
    displayName?: string;
    deps?: IArg[];
    onError?: IFromError<IElement>;
    aliases?: IProvideItem[];
}

export type IAtomize<IElement, State> = (
    render: IRenderFn<IElement, State>
) => Class<IReactComponent<IElement>>
