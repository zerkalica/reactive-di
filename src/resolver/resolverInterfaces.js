/* @flow */

import type {
    Dependency,
    DepId,
    AnyAnnotation
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
    builderInfo: CacheBuilderInfo;
    resolve<V>(dep: Dependency<V>): V;
    createCursor: CursorCreator;
    notifier: Notifier;
}

export type DependencyResolver = {
    get<V: any, E>(annotatedDep: Dependency<V>): AnyDep<V, E>;
}

export type ResolverType<A: AnyAnnotation> = (annotation: A, acc: AnnotationResolver) => void;
export type ResolverTypeMap = SimpleMap<string, ResolverType>;
