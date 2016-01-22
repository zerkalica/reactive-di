/* @flow */

import getFunctionName from '../utils/getFunctionName'
/* eslint-disable no-unused-vars */
import type {
    DepId,
    DepFn,
    Dependency,
    Deps,
    Info,
    Loader,
    Hooks,
    HooksRec,
    ClassAnnotation,
    FactoryAnnotation,
    ModelAnnotation,
    SetterAnnotation,
    MetaAnnotation,
    LoaderAnnotation,
} from './annotationInterfaces'

import type {Observable} from '../observableInterfaces'
import type {FromJS} from '../modelInterfaces'
/* eslint-enable no-unused-vars */

// implements Info
export class InfoImpl {
    tags: Array<string>;
    displayName: string;

    constructor(kind: string, name: string, tags: Array<string>) {
        this.displayName = kind + '@' + name
        this.tags = tags.concat([kind, name])
    }
}

function defaultFn(): void {}

// implements Hooks
export class HooksImpl<T> {
    onUnmount: () => void;
    onMount: () => void;
    onUpdate: (currentValue: T, nextValue: T) => void;

    constructor(r?: HooksRec<T> = {}) {
        this.onMount = r.onMount || defaultFn
        this.onUnmount = r.onUnmount || defaultFn
        this.onUpdate = r.onUpdate || defaultFn
    }
}

// implements ModelAnnotation
export class ModelAnnotationImpl<V, E> {
    kind: 'model';
    id: DepId;
    info: Info;
    source: Class<V>;
    loader: ?Loader<V, E>;
    childs: Array<Dependency>;
    statePath: Array<string>;
    fromJS: FromJS<V>;

    constructor(source: Class<V>, loader?: ?Loader<V, E>, tags: Array<string>) {
        this.kind = 'model'
        this.info = new InfoImpl(this.kind, getFunctionName(source), tags)
        this.loader = loader || null
        this.source = source
        this.childs = []
    }
}


/* eslint-disable no-undef */

// implements ClassAnnotation
export class ClassAnnotationImpl<V> {
    kind: 'class';
    id: DepId;
    info: Info;
    hooks: ?Hooks<V>;
    deps: ?Deps;
    proto: Class<V>;

    constructor(proto: Class<V>, deps: ?Deps, tags: Array<string>) {
        this.kind = 'class'
        this.info = new InfoImpl(this.kind, getFunctionName(proto), tags)
        this.hooks = null
        this.deps = deps
        this.proto = proto
    }
}

// implements FactoryAnnotation
export class FactoryAnnotationImpl<V> {
    kind: 'factory';
    id: DepId;
    info: Info;
    hooks: ?Hooks<V>;
    deps: ?Deps;
    fn: DepFn<V>;

    constructor(fn: DepFn<V>, deps: ?Deps, tags: Array<string>) {
        this.kind = 'factory'
        this.info = new InfoImpl(this.kind, getFunctionName(fn), tags)
        this.hooks = null
        this.deps = deps
        this.fn = fn
    }
}

// implements MetaAnnotation
export class MetaAnnotationImpl {
    kind: 'meta';
    id: DepId;
    info: Info;
    source: Dependency;

    constructor(source: Dependency, tags: Array<string>) {
        this.kind = 'meta'
        this.info = new InfoImpl(this.kind, getFunctionName(source), tags)
        this.source = source
    }
}

// implements SetterAnnotation
export class SetterAnnotationImpl<V> {
    kind: 'setter';
    id: DepId;
    info: Info;
    model: Class<V>;
    deps: ?Deps;
    facet: DepFn<V>;

    constructor(model: Class<V>, facet: DepFn<V>, deps: ?Deps, tags: Array<string>) {
        this.kind = 'setter'
        this.info = new InfoImpl(this.kind, getFunctionName(model), tags)
        this.facet = facet
        this.deps = deps
    }
}

// implements LoaderAnnotation
export class LoaderAnnotationImpl<V, E> {
    kind: 'loader';
    id: DepId;
    info: Info;
    hooks: ?Hooks<Observable<V, E>>;
    deps: ?Deps;
    fn: Loader<V, E>;

    constructor(fn: Loader<V, E>, deps: ?Deps, tags: Array<string>) {
        this.kind = 'loader'
        this.info = new InfoImpl(this.kind, getFunctionName(fn), tags)
        this.hooks = null
        this.deps = deps
        this.fn = fn
    }
}
