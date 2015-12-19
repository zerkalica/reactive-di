/* @flow */

import {DepId} from '../interfaces'

export type MergeRec = {
    [prop: string]: any;
};
export type StateModel = {
    [prop: string]: StateModel;
    $meta: {
        notify: () => void;
    },
}

export type ImmutableStateModel<T> = StateModel & {
    copy: (arg: MergeRec) => StateModel & T;
}

export type DepIdGetter<T: Object> = (obj: T) => DepId;
