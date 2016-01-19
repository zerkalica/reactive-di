/* @flow */

export type DepId = string;
export type Dependency<T> = Class<T>;

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
export type AnnotationDriver = {
    get<T, A: AnyAnnotation>(v: Dependency<T>): A;
    set<T, D: Dependency<T>, A: AnyAnnotation>(v: Class<T>, annotation: A): D;
};

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
