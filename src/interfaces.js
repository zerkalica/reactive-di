/* @flow */

export type DepId = string;
export type NotifyFn = () => void;
export type NotifyDepFn = (id: DepId) => void;
export type NotifyDepsFn = (ids: Array<DepId>) => void;
export type IPath = Array<string>;
export type Setter<T: Object> = (model: T) => void;
export type IdsMap = {[id: DepId]: Array<DepId>};
export type Dependency<T> = Class<T>;
