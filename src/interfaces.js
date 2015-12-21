/* @flow */

export type DepId = string;
export type NotifyDepFn = (id: DepId) => void;
export type NotifyDepsFn = (ids: Array<DepId>) => void;
export type Setter<T: Object> = (model: T) => void;
export type IdsMap = {[id: DepId]: Array<DepId>};
/* eslint-disable no-undef */
export type Dependency<T> = Class<T>;
/* eslint-enable no-undef */
export type FromJS<T: Object> = (data: Object) => T;
export type OnUpdateHook<T: Object> = (prevInstance: ?T, nextInstance: T) => void;
