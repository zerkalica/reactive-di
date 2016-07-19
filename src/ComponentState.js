// @flow

import type {Derivable} from './adapters/Adapter'
import type {ArgDep} from './annotations'

export interface DiResolver {
    start(): void;
    stop(): void;
}

export default class ComponentState<Component> {
    target: Component;
    deps: Derivable<any[]>;

    constructor(
        target: Component,
        deps: Derivable<any[]>
    ) {
        this.target = target
        this.deps = deps
    }
}

export type InjectComponent<Component, V> = (state: ComponentState<Component>) => V
