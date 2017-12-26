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

export const rdiInst = Symbol('rdi_inst')
export const rdiProp = Symbol('rdi_prop')

export type IArg = Function | {+[id: string]: Function}
export type IProvideItem = Function | Object | [Function | string, Function | mixed]

export type IPropsWithContext = {
    [id: string]: any;
    __lom_ctx?: Object;
}

export type IReactComponent<IElement> = {
    constructor(props: IPropsWithContext, context?: Object): IReactComponent<IElement>;
    render(): IElement;
    forceUpdate(): void;
}

export type IFromError<IElement> = (props: {error: Error, children: any}, state?: any) => IElement

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
