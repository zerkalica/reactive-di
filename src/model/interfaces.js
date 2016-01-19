/* @flow */

import type {DepId, FromJS} from '../interfaces'
import {AbstractDataCursor} from '../interfaces'

type MergeRec = {
    [prop: string]: any;
}

export type StateModelMeta = {
};

export type StateModel<T> = StateModelMeta & {
    [prop: string]: StateModel;
    copy: (arg: MergeRec) => StateModel & T;
};

export type DepIdGetter<T: Object> = (obj: T) => DepId;
export type CreateCursor = (path: Array<string>, fromJS: FromJS) => AbstractDataCursor;
export type FromJS<T: Object> = (data: Object) => T;

export type DataCursor<T: Object> = {
    get(): T;
    fromJS(data: Object): T;
    set(newModel: T): void;
}
