/* @flow */

import type {
    Deps,
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
    DepBase,
    DepArgs,
    AnyDep,
    ClassDep,
    FactoryDep,
    MetaDep
} from '../nodes/nodeInterfaces'

export type AnnotationResolver = {
    createCursor: CursorCreator;
    notifier: Notifier;
    getDeps(deps: ?Deps, id: DepId, tags: Array<string>): DepArgs;
    resolveRoot(annotatedDep: Dependency): AnyDep;
    resolve(annotatedDep: Dependency): AnyDep;
    addRelation(id: DepId): void;
    begin(dep: AnyDep): void;
    end<T: AnyDep>(dep: T): void;
    newRoot(): AnnotationResolver;
}

export type DependencyResolver = {
    get<V: any, E>(annotatedDep: Dependency<V>): AnyDep<V, E>;
}

export type ResolverType = (annotation: AnyAnnotation, acc: AnnotationResolver) => void;
export type ResolverTypeMap = SimpleMap<string, ResolverType>;
