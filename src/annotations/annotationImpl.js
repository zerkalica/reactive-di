/* @flow */

import getFunctionName from '../utils/getFunctionName'
/* eslint-disable no-unused-vars */
import type {
    DepId,
    DepFn,
    Dependency,
    Deps,
    Info,
    SetterResult,
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


// implements Info
class InfoImpl {
    tags: Array<string>;
    displayName: string;

    constructor(
        kind: string,
        name: string,
        tags: Array<string>
    ) {
        this.displayName = kind + '@' + name
        this.tags = tags.concat([kind, name])
    }
}

// implements AnnotationBase
class AnnotationBaseImpl<T: Function> {
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

// implements ModelInfo
class ModelInfoImpl<V> {
    childs: Array<Dependency>;
    statePath: Array<string>;
    fromJS: FromJS<V>;

    constructor() {
        this.childs = []
        this.statePath = []
    }
}

// implements ModelAnnotation
export class ModelAnnotationImpl<V: Object> {
    kind: 'model';
    base: AnnotationBase<Class<V>>;
    info: ModelInfo<V>;

    constructor(target: Class<V>, tags: Array<string>) {
        this.kind = 'model'
        this.base = new AnnotationBaseImpl(this.kind, tags, target)
        this.info = new ModelInfoImpl()
    }
}

// implements AsyncModelAnnotation
export class AsyncModelAnnotationImpl<V: Object, E> {
    kind: 'asyncmodel';
    base: AnnotationBase<Class<V>>;
    info: ModelInfo<V>;
    loader: ?AsyncResult<V, E>;

    constructor(
        target: Class<V>,
        tags: Array<string>,
        loader?: ?AsyncResult<V, E>
    ) {
        this.kind = 'asyncmodel'
        this.base = new AnnotationBaseImpl(this.kind, tags, target)
        this.info = new ModelInfoImpl()
        this.loader = loader || null
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
export class SetterAnnotationImpl<V: Object, E> {
    kind: 'setter';
    base: AnnotationBase<SetterResult<V, E>|DepFn<V>>;
    deps: ?Deps;
    model: Class<V>;

    constructor(
        model: Class<V>,
        target: SetterResult<V, E>|DepFn<V>,
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
    base: AnnotationBase<SetterResult<V, E>>;
    deps: ?Deps;

    constructor(
        target: SetterResult<V, E>,
        deps: ?Deps,
        tags: Array<string>
    ) {
        this.kind = 'loader'
        this.base = new AnnotationBaseImpl(this.kind, tags, target)
        this.deps = deps
    }
}
