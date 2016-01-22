/* @flow */
/* eslint-disable no-undef, no-unused-vars */

import type {
    Dependency,
    DepId,
    AnyAnnotation
} from '../annotations/annotationInterfaces'
import type {
    SimpleMap,
    CursorCreator
} from '../modelInterfaces'
import type {
    AnyDep,
    Notifier,
    ClassDep,
    FactoryDep,
    SubscribableDep
} from '../nodes/nodeInterfaces'

export type AnnotationResolver = {
    begin(dep: AnyDep): void;
    end(dep: AnyDep): void;
    resolve<V: any, E>(annotatedDep: Dependency<V>): AnyDep<V, E>;
    resolveMiddlewares(id: DepId, tags: Array<string>): ?Array<FactoryDep|ClassDep>;
    cursorCreator: CursorCreator;
    notifier: Notifier;
}

export type DependencyResolver = {
    get<V: any, E>(annotatedDep: Dependency<V>): SubscribableDep<V, E>;
}

export type ResolverType<A: AnyAnnotation> = (annotation: A, acc: AnnotationResolver) => void;
export type ResolverTypeMap = SimpleMap<string, ResolverType>;
