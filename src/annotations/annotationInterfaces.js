/* @flow */

import type {Observable} from '../observableInterfaces'
import type {FromJS, SimpleMap} from '../modelInterfaces'

export type DepId = string;
export type Tag = string;
export type DepFn<T> = (...x: any) => T;
export type Loader<T, E> = (...x: any) => Observable<T, E> | Promise<T>;
export type Deps<T> = Array<Dependency<T> | SimpleMap<string, Dependency<T>>>;

/* eslint-disable no-undef */
export type Dependency<T> = DepFn<T>|Class<T>;
/* eslint-enable */

export type HooksRec<T> = {
    onUnmount?: () => void;
    onMount?: () => void;
    onUpdate?: (currentValue: T, nextValue: T) => void;
}

export type Hooks<T> = {
    onUnmount: () => void;
    onMount: () => void;
    onUpdate: (currentValue: T, nextValue: T) => void;
}

export type Info = {
    tags: Array<string>;
    displayName: string;
}

/* eslint-disable no-unused-vars */
export type ModelAnnotation<V, E> = {
    kind: 'model';
    id: DepId;
    info: Info;
    source: Class<V>;
    loader: ?Loader<V, E>;
    childs: Array<Dependency>;
    statePath: Array<string>;
    fromJS: FromJS<V>;
}
/* eslint-enable no-unused-vars */

export type ClassAnnotation<V> = {
    kind: 'class';
    id: DepId;
    info: Info;
    hooks: ?Hooks<V>;
    deps: ?Deps;
    proto: Class<V>;
}

export type FactoryAnnotation<V> = {
    kind: 'factory';
    id: DepId;
    info: Info;
    hooks: ?Hooks<V>;
    deps: ?Deps;
    fn: DepFn<V>;
}

export type LoaderAnnotation<V, E> = {
    kind: 'loader';
    id: DepId;
    info: Info;
    hooks: ?Hooks<Observable<V, E>>;
    deps: ?Deps;
    fn: Loader<V, E>;
}

export type MetaAnnotation = {
    kind: 'meta';
    id: DepId;
    info: Info;
    source: Dependency;
}

/* eslint-disable no-unused-vars */
export type SetterAnnotation<V, M> = {
    kind: 'setter';
    id: DepId;
    info: Info;
    model: Class<V>;
    facet: DepFn<V>;
    deps: ?Deps;
}
/* eslint-enable no-unused-vars */

export type AnyAnnotation = MetaAnnotation
    | ModelAnnotation
    | SetterAnnotation
    | LoaderAnnotation
    | FactoryAnnotation
    | ClassAnnotation;

/* eslint-disable no-undef */
export type AnnotationDriver = {
    get<T: Dependency, A: AnyAnnotation>(dep: T): A;
    set<T: Dependency, A: AnyAnnotation>(dep: T, annotation: A): T;
};

export type Annotations = {
    /*
    klass<P: Object, T: Class<P>>(...deps: Deps): (target: T) => T,
    factory<A, T: DepFn<A>>(...deps: Deps): (target: T) => T,
    meta<A, T: Dependency<A>, R: Function>(source: T): R,
    model<P: Object, T: Class<P>>(source: T): T,
    setter<P: Object, M: Class<P>, A, T: DepFn<A>>(model: M, ...deps: Deps): (target: T) => T,
    hooks<A, T: Dependency<A>>(hooks: Hooks<T>): (target: T) => T
    */
}

/* eslint-enable no-undef */
