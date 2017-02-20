// @flow
import type {IContext} from '../commonInterfaces'
import type {IPullable, IHook, IHasForceUpdate} from '../hook/interfaces'
import type {ICacheable} from '../utils/resolveArgs'
import type {IDisposable} from '../utils/DisposableCollection'

import type {
    IRawArg,
    IDepRegister
} from '../interfaces'

export interface IConsumerMeta {
    key: Function;
    id: number;
    name: string;
    args: ?IRawArg[];
    hook: ?Function;
    errorComponent: ?Function;
    register: ?IDepRegister[];
}

export type ICreateElement<Element> = (...args: any[]) => Element

export type IComponent<Props: Object, State: Object, Element> = (props: Props, state: State) => Element

export interface IConsumerListener<Props: Object, Element> extends ICacheable<Props>, IDisposable, IPullable {
    displayName: string;
    updater: ISetProps<Props>;
    willUnmount(): void;
    willMount(prop: Props): void;
    render(): Element;
    shouldUpdate(newProps: Props): boolean;
}

export interface IComponentFactory<Component, Element> {
    createElement: ICreateElement<Element>;

    wrapComponent<Props: Object>(
        factory: IConsumerFactory<Props, Element, Component>
    ): Component;
}

export interface ISetProps<Props: Object> extends IHasForceUpdate {
    setProps(props: Props): void;
}

export interface IConsumerFactory<Props: Object, Element, Component> {
    displayName: string;
    id: number;
    component: Component;
    context: IContext;
    create(updater: ISetProps<Props>): IConsumerListener<Props, Element>;
}

export interface IConsumer<V: Object> extends ICacheable<V>, IHasForceUpdate, IDisposable, IPullable {
    displayName: string;
    id: number;
    t: 2;
    hooks: IHook<*>[];
}

export interface IHasCreateComponent<Element> {
    h(
        tag: any,
        props?: ?{[id: string]: mixed}
    ): Element;
}
