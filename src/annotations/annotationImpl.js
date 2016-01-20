/* @flow */

import getFunctionName from '../utils/getFunctionName'
import type {
    DepId,
    DepFn,
    Dependency,
    Deps,
    Info,
    Hooks,
    HooksRec
} from './annotationInterfaces'

export class InfoImpl {
    tags: Array<string>;
    displayName: string;

    constructor(displayName: string, tags: Array<string>) {
        this.displayName = displayName
        this.tags = tags
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

export class ModelAnnotationImpl {
    kind: 'model';
    id: DepId;
    info: Info;
    source: Dependency;

    constructor(source: Dependency, tags: Array<string>) {
        this.kind = 'model'
        this.info = new InfoImpl('model@' + getFunctionName(source), tags)
        this.source = source
    }
}

/* eslint-disable no-undef */
export class ClassAnnotationImpl<T: Object> {
    kind: 'class';
    id: DepId;
    info: Info;
    hooks: ?Hooks<T>;
    deps: ?Deps;
    proto: Class<T>;

    constructor(proto: Class<T>, tags: Array<string>, deps: ?Deps, hooks?: ?Hooks) {
        this.kind = 'class'
        this.info = new InfoImpl('class@' + getFunctionName(proto), tags)
        this.hooks = hooks || null
        this.deps = deps
        this.proto = proto
    }
}

export class FactoryAnnotationImpl<T> {
    kind: 'factory';
    id: DepId;
    info: Info;
    hooks: ?Hooks<T>;
    deps: ?Deps;
    fn: Function;

    constructor(fn: Dependency, tags: Array<string>, deps: ?Deps, hooks?: ?Hooks) {
        this.kind = 'factory'
        this.info = new InfoImpl('factory@' + getFunctionName(fn), tags)
        this.hooks = hooks || null
        this.deps = deps
        this.fn = fn
    }
}

export class MetaAnnotationImpl {
    kind: 'meta';
    id: DepId;
    info: Info;
    source: Dependency;

    constructor(source: Dependency, tags: Array<string>) {
        this.kind = 'meta'
        this.info = new InfoImpl('meta@' + getFunctionName(source), tags)
        this.source = source
    }
}

export class SetterAnnotationImpl {
    kind: 'setter';
    id: DepId;
    info: Info;
    model: Dependency;

    facet: Dependency;
    constructor(model: Dependency, facet: Dependency, tags: Array<string>) {
        this.kind = 'setter'
        this.info = new InfoImpl('setter@' + getFunctionName(model), tags)
        this.facet = facet
    }
}
