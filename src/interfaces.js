/* @flow */

export type DepId = string;
/* eslint-disable no-undef */
export type Dependency<T> = Class<T>;
/* eslint-enable no-undef */
export type FromJS<T: Object> = (data: Object) => T;

export class AbstractDataCursor<V> {
    get(): V|any {}
    fromJS: FromJS;
    /* eslint-disable no-unused-vars */
    set(newModel: V): boolean {
        return true
    }
    /* eslint-enable no-unused-vars */
}
