/* @flow */

export type SimpleMap<K, V> = {[id: K]: V};
export type Tag = string;
export type DepFn<T> = (...x: any) => T;
export type Dependency<T> = DepFn<T>|Class<T>;

export type DepItem = Dependency|SimpleMap<string, Dependency>;

export type Annotation = {
    kind: any;
    // key?: any;
    // tags?: Array<Tag>;
    target: Dependency;
};

export type DepAnnotation<T> = {
    kind: any;
    target: T;
    deps: Array<DepItem>;
}

export type GetAnnotation<V: Annotation> = (annotatedDep: Dependency<V>) => ?V;

export type GetDep<V> = (annotatedDep: Dependency<V>) => V;

export type AliasAnnotation = {
    kind: 'alias';
    target: Dependency;
    to: Dependency;
}
