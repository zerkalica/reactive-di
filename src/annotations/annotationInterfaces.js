/* @flow */
export type SimpleMap<K, V> = {[id: K]: V};

export type DepId = string;

export type DepFn<T> = (...x: any) => T;
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

export type Deps<T> = Array<Dependency<T> | SimpleMap<string, Dependency<T>>>;

export type Info = {
    tags: Array<string>;
    displayName: string;
}

export type ModelAnnotation<T: Object, L: Function> = {
    kind: 'model';
    id: DepId;
    info: Info;
    /* eslint-disable no-undef */
    source: Class<T>;
    loader: ?L;
    childs: Array<Dependency>;
    /* eslint-enable no-undef */
}

export type ClassAnnotation<T: Object> = {
    kind: 'class';
    id: DepId;
    info: Info;
    hooks: ?Hooks<T>;
    deps: ?Deps;
    /* eslint-disable no-undef */
    proto: Class<T>;
    /* eslint-enable no-undef */
}

export type FactoryAnnotation<T: Function> = {
    kind: 'factory';
    id: DepId;
    info: Info;
    hooks: ?Hooks<T>;
    deps: ?Deps;
    fn: T;
}

export type MetaAnnotation<T> = {
    kind: 'meta';
    id: DepId;
    info: Info;
    source: Dependency<T>;
}

export type SetterAnnotation<M, T: Function> = {
    kind: 'setter';
    id: DepId;
    info: Info;
    /* eslint-disable no-undef */
    model: Class<M>;
    /* eslint-enable no-undef */
    facet: T;
}

export type AnyAnnotation = MetaAnnotation
    | ModelAnnotation
    | SetterAnnotation
    | FactoryAnnotation
    | ClassAnnotation;

/* eslint-disable no-undef */
export type AnnotationDriver = {
    get<R: any, T: Dependency<R>, A: AnyAnnotation>(dep: T): A;
    set<R: any, T: Dependency<R>, A: AnyAnnotation>(dep: T, annotation: A): T;
};

export type IAnnotations = {
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
