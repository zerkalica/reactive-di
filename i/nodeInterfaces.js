/* @flow */

import type {ClassDep} from 'reactive-di/i/plugins/classInterfaces'
import type {FactoryDep} from 'reactive-di/i/plugins/factoryInterfaces'
import type {GetterDep} from 'reactive-di/i/plugins/getterInterfaces'
import type {
    LoaderDep,
    ResetDep
} from 'reactive-di/i/plugins/loaderInterfaces'
import type {MetaDep} from 'reactive-di/i/plugins/metaInterfaces'
import type {ModelDep} from 'reactive-di/i/plugins/modelInterfaces'
import type {ObservableDep} from 'reactive-di/i/plugins/observableInterfaces'
import type {SyncSetterDep} from 'reactive-di/i/plugins/setterInterfaces'
import type {AsyncSetterDep} from 'reactive-di/i/plugins/setterInterfaces'
import type {
    Info,
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
export type AnyDep =
    ClassDep
    | FactoryDep
    | MetaDep
    | ModelDep
    | LoaderDep
    | ObservableDep
    | ResetDep
    | SyncSetterDep
    | AsyncSetterDep
    | GetterDep;

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

    info: Info;
    relations: Array<DepId>;
}

export type ResolvableDep<V> = {
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

    resolveAnnotation(annotation: AnyAnnotation): AnyDep;
    resolve(annotatedDep: Dependency): AnyDep;
    addRelation(id: DepId): void;
    begin(dep: AnyDep): void;
    end(dep: AnyDep): void;
    newRoot(): AnnotationResolver;
}

export type DepArgs = {
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<AnyDep>;
}

export type Invoker<V> = {
    invoke(args: Array<any>): V;
}

export type DepsResolver = {
    getDeps(deps: ?Deps, annotatedDep: Dependency, tags: Array<Tag>): DepArgs;
}
