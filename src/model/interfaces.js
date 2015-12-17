/* @flow */

import {DepId} from '../interfaces'

export type MergeRec = {
    [prop: string]: any;
};
export type StateModel<T> = {
    [prop: string]: StateModel;
    $meta: {
        notify: () => void;
    },
    copy: (arg: MergeRec) => StateModel & T;
};

export type DepIdGetter<T: Object> = (obj: T) => DepId;
