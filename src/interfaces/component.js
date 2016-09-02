// @flow

import type {Atom, Derivable} from './atom'

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

export type CreateWidget<Props, State, Component> = (
    Target: Class<SrcComponent<Props, State>>,
    atom: Derivable<*>,
    isMounted: Atom<boolean>
) => Component
