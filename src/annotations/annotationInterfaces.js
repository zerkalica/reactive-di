/* @flow */

export type DepId = string;
export type Dependency = Function;

export type Hooks<T> = {
    onUnmount(): void;
    onMount(): void;
    onUpdate(currentValue: T, nextValue: T): void;
}

/* eslint-disable no-undef */

export type Deps = Array<Dependency> | {[prop: string]: Dependency};

export type Info = {
    tags: Array<string>;
    displayName: string;
}

export type ModelAnnotation = {
    kind: 1; // 'model';
    id: DepId;
    info: Info;
    source: Dependency;
}

export type ClassAnnotation<T: Object> = {
    kind: 2; // 'class';
    id: DepId;
    info: Info;
    hooks: ?Hooks<T>;
    deps: ?Deps;
    proto: Class<T>;
}

export type FactoryAnnotation<T> = {
    kind: 3; // 'factory';
    id: DepId;
    info: Info;
    hooks: ?Hooks<T>;
    deps: ?Deps;
    fn: Function;
}

export type MetaAnnotation = {
    kind: 4; // 'meta';
    id: DepId;
    info: Info;
    source: Dependency;
}

export type SetterAnnotation<T> = {
    kind: 5; // 'setter';
    id: DepId;
    info: Info;
    model: Dependency;

    hooks: ?Hooks<T>;
    deps: ?Deps;
    fn: Function;
}

export type AnyAnnotation = MetaAnnotation | SetterAnnotation | ModelAnnotation | FactoryAnnotation | ClassAnnotation;

export type AnnotationDriver<T: Function> = {
    get(v: T): AnyAnnotation;
    set(v: T, annotation: AnyAnnotation): T;
};

type Setter<T: Function, M: Object> = (model: Class<M>, ...rawDeps: Deps) => (sourceFn: T) => T;
type Factory<T: Function> = (...rawDeps: Deps) => (fn: T) => T;
type HooksAnnotation<T: Function> = (hooks: Hooks) => (target: T) => T;
type Klass<T> = (...rawDeps: Deps) => (proto: Class<T>) => T;
type Meta<T> = (value: T) => T;
type Model<T> = (mdl: Class<T>) => T;

export type IAnnotations = {
    setter: Setter;
    factory: Factory;
    klass: Klass;
    model: Model;
    meta: Meta;
    hooks: HooksAnnotation;
}

/* eslint-enable no-undef */
