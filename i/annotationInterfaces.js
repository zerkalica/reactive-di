/* @flow */

export type Tag = string;
export type DepFn<T> = (...x: any) => T;
export type Dependency<T> = DepFn<T>|Class<T>;
export type ArgsObject = {
    [name: string]: Dependency;
}
export type DepItem = Dependency|ArgsObject;

export type Annotation = {
    kind: any;
    // key?: any;
    // tags?: Array<Tag>;
    target: Dependency;
};

export type GetDep<V> = (annotatedDep: Dependency<V>) => V;

export type CreateId = () => string;
