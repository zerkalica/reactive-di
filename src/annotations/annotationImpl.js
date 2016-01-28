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
    Setter,

    Hooks,
    HooksRec,

    ModelInfo,
    AnnotationBase,
    ClassAnnotation,
    FactoryAnnotation,
    AsyncModelAnnotation,
    ModelAnnotation,
    SetterAnnotation,
    MetaAnnotation,
    LoaderAnnotation,
} from './annotationInterfaces'

import type {Observable} from '../observableInterfaces'
import type {FromJS} from '../modelInterfaces'
/* eslint-enable no-unused-vars */



// implements AnnotationBase
export class AnnotationBaseImpl<T: Function> {
    id: DepId;
    info: Info;
    target: T;

    constructor(
        kind: string,
        tags: Array<string>,
        target: T
    ) {
        const name: string = getFunctionName(target);
        this.info = new InfoImpl(kind, name, tags)
        this.target = target
    }
}


/* eslint-disable no-undef */

// implements ClassAnnotation
export class ClassAnnotationImpl<V: Object> {
    kind: 'class';
    base: AnnotationBase<Class<V>>;
    deps: ?Deps;

    constructor(target: Class<V>, deps: ?Deps, tags: Array<string>) {
        this.kind = 'class'
        this.base = new AnnotationBaseImpl(this.kind, tags, target)
        this.deps = deps
    }
}

// implements FactoryAnnotation
export class FactoryAnnotationImpl<V> {
    kind: 'factory';
    base: AnnotationBase<DepFn<V>>;
    deps: ?Deps;

    constructor(target: DepFn<V>, deps: ?Deps, tags: Array<string>) {
        this.kind = 'factory'
        this.base = new AnnotationBaseImpl(this.kind, tags, target)
        this.deps = deps
    }
}

// implements MetaAnnotation
export class MetaAnnotationImpl<V> {
    kind: 'meta';
    base: AnnotationBase<Dependency<V>>;

    constructor(target: Dependency, tags: Array<string>) {
        this.kind = 'meta'
        this.base = new AnnotationBaseImpl(this.kind, tags, target)
    }
}

// implements SetterAnnotation
export class SetterAnnotationImpl<V: Object> {
    kind: 'setter';
    base: AnnotationBase<DepFn<Setter<V>>>;
    deps: ?Deps;
    model: Class<V>;

    constructor(
        model: Class<V>,
        target: DepFn<Setter<V>>,
        deps: ?Deps,
        tags: Array<string>
    ) {
        this.kind = 'setter'
        this.base = new AnnotationBaseImpl(this.kind, tags, target)
        this.deps = deps
        this.model = model
    }
}

// implements LoaderAnnotation
export class LoaderAnnotationImpl<V: Object, E> {
    kind: 'loader';
    base: AnnotationBase<Loader<V, E>>;
    deps: ?Deps;

    constructor(
        target: Loader<V, E>,
        deps: ?Deps,
        tags: Array<string>
    ) {
        this.kind = 'loader'
        this.base = new AnnotationBaseImpl(this.kind, tags, target)
        this.deps = deps
    }
}
