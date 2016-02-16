/* @flow */

export type DepFn<T> = (...x: any) => T;
export type Dependency<T> = DepFn<T>|Class<T>; // eslint-disable-line
export type GetDep<V> = (annotatedDep: Dependency<V>) => V;
