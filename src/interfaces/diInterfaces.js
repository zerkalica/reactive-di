/* @flow */

import type {Dependency} from './annotationInterfaces'

export type SetState<State: Object> = (state: State) => State;

export type Updater<State: Object> = {
    getInitialState(): State;
    mount(): void;
    unmount(): void;
}

export type CreateUpdater<State: Object, ModelDef: Object> = (
    viewModelDef: ModelDef,
    setState: SetState<State>,
    displayName: string
) => Updater<State>;

export type ReactiveDi = {
    get(annotatedDep: Dependency): any;
    createUpdater: CreateUpdater;
}
