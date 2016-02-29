/* @flow */

import type {SimpleMap} from 'reactive-di/i/modelInterfaces'
export type DepId = string;
export type Tag = string;
export type DepFn<T> = (...x: any) => T;
export type Dependency<T> = DepFn<T>|Class<T>; // eslint-disable-line

export type DepItem = Dependency|SimpleMap<string, Dependency>;
export type Deps = Array<DepItem>;

export type IdCreator = {
    createId(): string;
}

export type Annotation<T> = {
    kind: any;
    target: T;
    id: DepId;
}

export type DepAnnotation<T> = Annotation<T> & {
    deps: Array<DepItem>;
}

export type AnnotationMap<A: Annotation> = Map<Function, A>;

export type AnnotationDriver = {
    hasAnnotation(dep: Dependency): boolean;
    getAnnotation<V, A: Annotation>(dep: Dependency<V>): A; // eslint-disable-line
    annotate<V, T: Dependency<V>, A: Annotation>(dep: T, annotation: A): T; // eslint-disable-line
};
