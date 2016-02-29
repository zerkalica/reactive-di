/* @flow */

import type {
    Annotation,
    DepId,
    Dependency,
    Deps,
    Tag,
    AnyAnnotation
} from 'reactive-di/i/annotationInterfaces'
import type {
    CursorCreator,
    Notify
} from 'reactive-di/i/modelInterfaces'

export type EntityMeta<E> = {
    pending: boolean;
    rejected: boolean;
    fulfilled: boolean;
    reason: ?E;
}

export type Cacheable = {
    isRecalculate: boolean;
};

export type DepBase = {
    id: DepId;
    isRecalculate: boolean;

    displayName: string;
    tags: Array<Tag>;
    relations: Array<DepId>;
}

export type ResolvableDep<V> = {
    kind: string;
    base: DepBase;
    resolve(): V;
}

export type ListenerManager = {
    notify: Notify;
    add<V, E>(target: ResolvableDep<V>): Observable<V, E>;
}

export type AnnotationResolver = {
    createCursor: CursorCreator;
    listeners: ListenerManager;
    middlewares: Map<Dependency|Tag, Array<Dependency>>;

    resolveAnnotation<AnyDep: Object>(annotation: Annotation): AnyDep;
    resolve<AnyDep: Object>(annotatedDep: Dependency): AnyDep;
    createId(): DepId;
    addRelation(id: DepId): void;
    begin<AnyDep: Object>(dep: AnyDep): void;
    end<AnyDep: Object>(dep: AnyDep): void;
    newRoot(): AnnotationResolver;
}

export type DepArgs = {
    deps: Array<ResolvableDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<ResolvableDep>;
}

export type Invoker<V> = {
    invoke(args: Array<any>): V;
}

export type DepsResolver = {
    getDeps(deps: ?Deps, annotatedDep: Dependency, tags: Array<Tag>): DepArgs;
}
