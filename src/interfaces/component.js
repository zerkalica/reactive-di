// @flow
import type {IContext} from 'reactive-di/interfaces/internal'
import type {DepInfo} from 'reactive-di/core/common'

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

export type SrcComponent<Props, State> = (props: Props, state: State) => any

export type CreateElement<Component, Element> = (
    tag: Component,
    props?: ?{[id: string]: mixed},
    children?: mixed
) => Element

export interface IComponentControllable<State, Component> {
    getState(): ?State;
    onUnmount(): void;
    onMount(): void;
    onUpdate(): void;
}

export type SetState<State> = (state: State) => void

export type CreateControllable<State, Component> = (
    setState: SetState<State>
) => IComponentControllable<State, Component>

export interface ComponentFactory {
    wrapComponent<Props, State>(info: DepInfo<SrcComponent<Props, State>, *>): mixed;
}
