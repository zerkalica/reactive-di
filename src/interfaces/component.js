// @flow

import type {Atom, Derivable} from 'reactive-di/interfaces/atom'
import type {IContext} from '../common'
import type {Key} from 'reactive-di/interfaces/deps'

export type SrcComponent<Props, State> = (props: Props, state: State) => any

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

export type CreateElement<Component, Element> = (
    tag: Component,
    props?: ?{[id: string]: mixed},
    children?: mixed
) => Element

export interface IComponentControllable<State> {
    wrapElement(tag: Function): Function;
    getState(): ?State;
    onUnmount(): void;
    onMount(): void;
    onUpdate(): void;
}

export type CreateControllable<State> = (
    setState: (state: State) => void
) => IComponentControllable<State>

export type GetComponent<Component> = (target: Function) => Component

export type CreateWidget<Props, State, Component> = (
    Target: Class<SrcComponent<Props, State>>,
    createControllable: CreateControllable<State>
) => Component
