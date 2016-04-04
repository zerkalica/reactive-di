/* @flow */
import type {
    DepItem,
    Dependency
} from 'reactive-di/i/annotationInterfaces'

export type ValueAnnotation<T: Dependency> = {
    kind: 'value',
    target: T;
    value: any;
}

export type AliasAnnotation = {
    kind: 'alias',
    target: Dependency;
    alias: Dependency;
}

export type FacetAnnotation<T: Dependency> = {
    kind: 'facet',
    target: T;
    deps: Array<DepItem>;
}

export type MiddlewareAnnotation<T: Dependency> = {
    kind: 'middleware',
    target: T;
    sources: Array<DepItem>;
}

export type FactoryAnnotation<T: Dependency> = {
    kind: 'factory',
    target: T;
    deps: Array<DepItem>;
}

export type ClassAnnotation<T: Dependency> = {
    kind: 'klass',
    target: T;
    deps: Array<DepItem>;
}
