/* @flow */

export type DepId = string;

type DepFn<T> = (...x: any) => T;
/* eslint-disable no-undef */
export type Dependency<T> = DepFn<T>|Class<T>;
/* eslint-enable */

export type Hooks<T> = {
    onUnmount: () => void;
    onMount: () => void;
    onUpdate: (currentValue: ?T, nextValue: T) => void;
}

export type Deps = Array<Dependency | {[prop: string]: Dependency}>;

export type Info = {
    tags: Array<string>;
    displayName: string;
}

export type ModelAnnotation = {
    kind: 'model';
    id: DepId;
    info: Info;
    source: Dependency;
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

export type FactoryAnnotation<T> = {
    kind: 'factory';
    id: DepId;
    info: Info;
    hooks: ?Hooks<T>;
    deps: ?Deps;
    fn: Function;
}

export type MetaAnnotation = {
    kind: 'meta';
    id: DepId;
    info: Info;
    source: Dependency;
}

export type SetterAnnotation = {
    kind: 'setter';
    id: DepId;
    info: Info;
    model: Dependency;
    facet: Dependency;
}

export type AnyAnnotation = MetaAnnotation
    | ModelAnnotation
    | SetterAnnotation
    | FactoryAnnotation
    | ClassAnnotation;

/* eslint-disable no-undef */

export type AnnotationDriverGetter = {
    get<T, A: AnyAnnotation>(v: Dependency<T>): A;
};

export type AnnotationDriverSetter = {
    set<T, D: Dependency<T>, A: AnyAnnotation>(v: Class<T>, annotation: A): D;
};

export type AnnotationDriver = AnnotationDriverGetter & AnnotationDriverSetter;

type Setter<T: Function, M: Object> = (model: Class<M>, ...rawDeps: Deps) => (sourceFn: T) => T;
type Factory<T: Function> = (...rawDeps: Deps) => (fn: T) => T;
type HooksAnnotation<T: Function> = (hooks: Hooks) => (target: T) => T;
type Klass<T> = (...rawDeps: Deps) => (proto: Class<T>) => T;
type Meta<T> = (value: T) => T;
type Model<T> = (mdl: Class<T>) => T;
/* eslint-enable no-undef */

export type IAnnotations = {
    setter: Setter;
    factory: Factory;
    klass: Klass;
    model: Model;
    meta: Meta;
    hooks: HooksAnnotation;
}

/* eslint-enable no-undef */
