/* @flow */

import type {Observable} from '../observableInterfaces'
import type {FromJS, SimpleMap} from '../modelInterfaces'

export type DepId = string;
export type Tag = string;
export type DepFn<T> = (...x: any) => T;

export type AsyncResult<V: Object, E> = Observable<V, E> | Promise<V>;
export type SetterResult<V> = Promise<V> | V;
export type Setter<V> = DepFn<SetterResult<V>>;

export type Loader<V: Object, E> = DepFn<AsyncResult<V, E>>;

export type Deps = Array<Dependency | SimpleMap<string, Dependency>>;

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

export type AnnotationBase<T> = {
    id: DepId;
    info: Info;
    target: T;
}

export type ModelInfo<V> = {
    childs: Array<Dependency>;
    statePath: Array<string>;
    fromJS: FromJS<V>;
}

/* eslint-disable no-unused-vars */
export type ModelAnnotation<V: Object> = {
    kind: 'model';
    base: AnnotationBase<Class<V>>;
    info: ModelInfo<V>;
}

export type AsyncModelAnnotation<V: Object, E> = {
    kind: 'asyncmodel';
    base: AnnotationBase<Class<V>>;
    info: ModelInfo<V>;
    loader: ?Loader<V, E>;
}

/* eslint-enable no-unused-vars */

export type ClassAnnotation<V: Object> = {
    kind: 'class';
    base: AnnotationBase<Class<V>>;
    deps: ?Deps;
}

export type FactoryAnnotation<V> = {
    kind: 'factory';
    base: AnnotationBase<DepFn<V>>;
    deps: ?Deps;
}

export type MetaAnnotation<V> = {
    kind: 'meta';
    base: AnnotationBase<Dependency<V>>;
}

/* eslint-disable no-unused-vars */
export type SetterAnnotation<V: Object> = {
    kind: 'setter';
    base: AnnotationBase<DepFn<Setter<V>>>;
    deps: ?Deps;
    model: Class<V>;
}

export type LoaderAnnotation<V: Object, E> = {
    kind: 'loader';
    base: AnnotationBase<Loader<V, E>>;
    deps: ?Deps;
}
/* eslint-enable no-unused-vars */

export type AnyAnnotation =
    MetaAnnotation
    | ModelAnnotation
    | AsyncModelAnnotation
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
