/* @flow */

import {DepId} from '../interfaces'

export type MergeRec = {
    [prop: string]: any;
}

export type StateModelMeta = {
    $meta: {}
};

export type StateModel<T> = StateModelMeta & {
    [prop: string]: StateModel;
    copy: (arg: MergeRec) => StateModel & T;
};

export type DepIdGetter<T: Object> = (obj: T) => DepId;
export type SetState<T> = (state: StateModel<T>) => void;
