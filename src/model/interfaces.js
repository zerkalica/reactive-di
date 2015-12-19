/* @flow */

import {DepId} from '../interfaces'

export type MergeRec = {
    [prop: string]: any;
}

type Notify = () => void;

export type StateModelNotify = {
    $meta: {
        _notify: Notify;
    }
};

export type StateModel<T> = StateModelNotify & {
    [prop: string]: StateModel;
    copy: (arg: MergeRec) => StateModel & T;
};

export type DepIdGetter<T: Object> = (obj: T) => DepId;
export type SetState<T> = (state: StateModel<T>) => void;
