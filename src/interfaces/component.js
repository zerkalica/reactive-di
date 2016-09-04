// @flow

import type {Atom, Derivable} from 'reactive-di/interfaces/atom'

export interface SrcComponent<Props, State> extends React$Component<void, Props, State> {
    props: Props;
    state: State;
    $: HTMLElement;

    render(): any;
    componentDidMount(): void;
    componentDidUpdate(nextProps: Props, nextState: State): void;
    componentWillUnmount(): void;
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

export interface IComponentControllable<State> {
    getState(): ?State;
    onUnmount(): void;
    onMount(): void;
}

export type CreateControllable<State> = (setState: (state: State) => void) => IComponentControllable<State>

export type CreateWidget<Props, State, Component> = (
    Target: Class<SrcComponent<Props, State>>,
    createControllable: CreateControllable<State>
) => Component
