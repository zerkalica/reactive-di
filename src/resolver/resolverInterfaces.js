/* @flow */

import type {
    Dependency,
    DepId,
    AnyAnnotation,
    AnnotationDriver
} from '../annotations/annotationInterfaces'

import type {
    SimpleMap,
    Notifier,
    CursorCreator
} from '../modelInterfaces'

import type {
    AnyDep,
    ClassDep,
    FactoryDep
} from '../nodes/nodeInterfaces'

export type CacheBuilderInfo = {
    parents: Array<Set<DepId>>;
    cache: SimpleMap<DepId, AnyDep>;
}

export type AnnotationResolver = {
    driver: AnnotationDriver;
    resolvers: SimpleMap<string, ResolverType>;
    builderInfo: CacheBuilderInfo;
    middlewares: SimpleMap<Dependency|string, Array<Dependency>>;
    createCursor: CursorCreator;
    notifier: Notifier;
}

export type DependencyResolver = {
    get<V: any, E>(annotatedDep: Dependency<V>): AnyDep<V, E>;
}

export type ResolverType = (annotation: AnyAnnotation, acc: AnnotationResolver) => void;
export type ResolverTypeMap = SimpleMap<string, ResolverType>;
