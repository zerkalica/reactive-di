// @flow
import type {
    IRawArg,
    IDepRegister
} from '../interfaces'

export interface IConsumerMeta {
    key: Function;
    id: number;
    name: string;
    propsTo: ?Function;
    args: ?IRawArg[];
    register: ?IDepRegister[];
}

export type ICreateElement<Element> = (...args: any[]) => Element

export type IComponent<Props: Object, State: Object, Element> = (props: Props, state: State) => Element

export interface IConsumerProps<Props, Element> {
    displayName: string;
    hasHooks: boolean;
    props: Props;
    init(rc: IRawComponent<Props>, props: Props): void;
    onComponentWillMount(): void;
    onComponentWillUnmount(): void;
    render(props: Props): ?Element;
    onComponentShouldUpdate(newProps: Props): boolean;
}

export type IComponentFn = Function
export type ICreateComponent = (dn: string) => IComponentFn

export interface IRawComponent<Props: Object> {
    props: Props;
    forceUpdate(): void;
}

export interface RdiProps {
    _rdi: IConsumerProps<RdiProps, Element>;
}
