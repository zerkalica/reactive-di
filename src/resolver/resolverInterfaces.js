/* @flow */
/* eslint-disable no-undef, no-unused-vars */

import type {
    SimpleMap,
    Dependency,
    DepId,
    AnyAnnotation
} from '../annotations/annotationInterfaces'
import type {AnyDep} from '../nodes/nodeInterfaces'

export type Middlewares = SimpleMap<DepId, Dependency>;

export type AnnotationResolver = {
    begin<V, E>(dep: AnyDep<V, E>): void;
    end<V, E>(dep: AnyDep<V, E>): void;
    resolve<V>(annotatedDep: Dependency<V>): V;
    middlewares: Middlewares;
}

export type DependencyResolver = {
    get<V>(annotatedDep: Dependency<V>): V;
}

export type ResolverType<A: AnyAnnotation> = (annotation: A, acc: AnnotationResolver) => void;
export type ResolverTypeMap = SimpleMap<string, ResolverType>;
