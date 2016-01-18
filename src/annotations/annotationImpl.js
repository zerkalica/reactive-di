/* @flow */

import getFunctionName from '../utils/getFunctionName'
import type {DepId} from '../interfaces'
import type {
    Dependency,
    Deps,
    Info,
    Hooks
} from './annotationInterfaces'

export class InfoImpl {
    tags: Array<string>;
    displayName: string;

    constructor(displayName: string, tags: Array<string>) {
        this.displayName = displayName
        this.tags = tags
    }
}

function defaultFn() {}

export class HooksImpl<T> {
    onUnmount: () => void;
    onMount: () => void;
    onUpdate: (currentValue: T, nextValue: T) => void;

    constructor(r?: {
        onUnmount?: () => void;
        onMount?: () => void;
        onUpdate?: (currentValue: T, nextValue: T) => void;
    } = {}) {
        this.onMount = r.onMount || defaultFn
        this.onUnmount = r.onUnmount || defaultFn
        this.onUpdate = r.onUpdate || defaultFn
    }
}

export class ModelAnnotationImpl {
    kind: 1;
    id: DepId;
    info: Info;
    source: Dependency;

    constructor(source: Dependency, tags: Array<string>) {
        this.kind = 1
        this.info = new InfoImpl('model@' + getFunctionName(source), tags)
        this.source = source
    }
}

/* eslint-disable no-undef */
export class ClassAnnotationImpl<T: Object> {
    kind: 2;
    id: DepId;
    info: Info;
    hooks: ?Hooks<T>;
    deps: ?Deps;
    proto: Class<T>;

    constructor(proto: Class<T>, tags: Array<string>, deps: ?Deps, hooks?: ?Hooks) {
        this.kind = 2
        this.info = new InfoImpl('class@' + getFunctionName(proto), tags)
        this.hooks = hooks || null
        this.deps = deps
        this.proto = proto
    }
}

export class FactoryAnnotationImpl<T> {
    kind: 3; // 'factory';
    id: DepId;
    info: Info;
    hooks: ?Hooks<T>;
    deps: ?Deps;
    fn: Function;

    constructor(fn: Dependency, tags: Array<string>, deps: ?Deps, hooks?: ?Hooks) {
        this.kind = 3
        this.info = new InfoImpl('factory@' + getFunctionName(fn), tags)
        this.hooks = hooks || null
        this.deps = deps
        this.fn = fn
    }
}

export class MetaAnnotationImpl {
    kind: 4; // 'meta';
    id: DepId;
    info: Info;
    source: Dependency;

    constructor(source: Dependency, tags: Array<string>) {
        this.kind = 4
        this.info = new InfoImpl('meta@' + getFunctionName(source), tags)
        this.source = source
    }
}

export class SetterAnnotationImpl {
    kind: 5; // 'setter';
    id: DepId;
    info: Info;
    model: Dependency;

    facet: Dependency;
    constructor(model: Dependency, facet: Dependency, tags: Array<string>) {
        this.kind = 5
        this.info = new InfoImpl('setter@' + getFunctionName(model), tags)
        this.facet = facet
    }
}
