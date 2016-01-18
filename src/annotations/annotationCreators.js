/* @flow */

import getFunctionName from '../utils/getFunctionName'

import type {
    Dependency,
    Deps,
    Hooks,
    ClassAnnotation,
    FactoryAnnotation,
    MetaAnnotation,
    ModelAnnotation,
    SetterAnnotation
} from './annotationInterfaces'

export function createHooks<T>(hooks: Hooks<T>): Hooks<T> {
    // validations ...
    return hooks
}

export function createModelAnnotation(source: Dependency, tags: Array<string>): ModelAnnotation {
    return {
        kind: 1,
        base: {
            displayName: 'model@' + getFunctionName(source),
            tags
        },
        source
    }
}

/* eslint-disable no-undef */
export function createClassAnnotation<T: Object>(proto: Class<T>, tags: Array<string>, deps: ?Deps, hooks: ?Hooks): ClassAnnotation<T> {
/* eslint-enable no-undef */
    return {
        kind: 2,
        base: {
            displayName: 'class@' + getFunctionName(proto),
            tags
        },
        hooks,
        deps,
        proto
    }
}

export function createFactoryAnnotation(fn: Dependency, tags: Array<string>, deps: ?Deps, hooks: ?Hooks): FactoryAnnotation {
    return {
        kind: 3,
        base: {
            displayName: 'factory@' + getFunctionName(fn),
            tags
        },
        hooks,
        deps,
        fn
    }
}

export function createMetaAnnotation(source: Dependency, tags: Array<string>): MetaAnnotation {
    return {
        kind: 4,
        base: {
            displayName: 'meta@' + getFunctionName(source),
            tags
        },
        source
    }
}

export function createSetterAnnotation(fn: Dependency, model: Dependency, tags: Array<string>, deps: ?Deps, hooks: ?Hooks): SetterAnnotation {
    return {
        kind: 5,
        base: {
            displayName: 'setter@' + getFunctionName(fn),
            tags
        },
        model,
        hooks,
        deps,
        fn
    }
}
