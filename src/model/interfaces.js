/* @flow */

import {DepId} from '../interfaces'

export type MergeRec = {
    [prop: string]: any;
}

export type StateModelNotify = {
    [prop: string]: StateModelNotify;
    $meta: {
        notify: () => void;
    }
}

export type ImmutableStateModel<T> = {
    [prop: string]: ImmutableStateModel<T>;
    copy: (arg: MergeRec) => ImmutableStateModel<T>;
}

export type StateModel<T> = ImmutableStateModel<T> & StateModelNotify

export type DepIdGetter<T: Object> = (obj: T) => DepId
