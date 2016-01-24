/* @flow */

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
    ClassDep,
    FactoryDep,
    Relations
} from '../nodes/nodeInterfaces'

export type Updater<V: Object, E> = {
    pending: () => void;
    success: (value: V) => void;
    error: (error: E) => void;
}

export type Notifier = {
    notify: () => void;
}

export type AnnotationResolver = {
    parents: Array<Set<DepId>>;
    cache: SimpleMap<DepId, AnyDep>;
    resolve<V>(dep: Dependency<V>): V;
    createCursor: CursorCreator;
    notifier: Notifier;
}

export type DependencyResolver = {
    get<V: any, E>(annotatedDep: Dependency<V>): AnyDep<V, E>;
}

export type ResolverType<A: AnyAnnotation> = (annotation: A, acc: AnnotationResolver) => void;
export type ResolverTypeMap = SimpleMap<string, ResolverType>;
