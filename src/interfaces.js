// @flow

export type TypedPropertyDescriptor<T> = {
    enumerable?: boolean;
    configurable?: boolean;
    writable?: boolean;
    value?: T;
    initializer?: () => T;
    get?: () => T;
    set?: (value: T) => void;
}

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
