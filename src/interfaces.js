/* @flow */

export type DepId = string;
export type Setter<T: Object> = (value: T|Promise<T>) => void;
export type IdsMap = {[id: DepId]: Array<DepId>};
/* eslint-disable no-undef */
export type Dependency<T> = Class<T>;
/* eslint-enable no-undef */
export type FromJS<T: Object> = (data: Object) => T;

export type OnUpdate<T: Object> = (prevInstance: ?T, nextInstance: T) => void;
export type OnMount<T: Object> = (instance: ?T) => void;
export type OnUnmount<T: Object> = (instance: ?T) => void;

export class AbstractDataCursor<V> {
    get(): V|any {
    }
    fromJS: FromJS;
    /* eslint-disable no-unused-vars */
    set(newModel: V): boolean {
        return true
    }
    /* eslint-enable no-unused-vars */
}
export type BaseDep<T> = {
    id: DepId;
    deps: Array<T>;
}
