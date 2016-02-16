/* @flow */

import type {AsyncModelDep} from 'reactive-di/i/plugins/asyncmodelInterfaces'
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
import type {SetterDep} from 'reactive-di/i/plugins/setterInterfaces'
import type {
    Info,
    DepId,
    Dependency,
    Deps,
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
    | AsyncModelDep
    | ModelDep
    | LoaderDep
    | ObservableDep
    | ResetDep
    | SetterDep
    | GetterDep;

export type Cacheable = {
    isRecalculate: boolean;
};

export type AsyncSubscription = {
    refCount: number;
    unsubscribe: () => void;
};

export type DepBase = {
    id: DepId;
    isRecalculate: boolean;

    info: Info;
    relations: Array<DepId>;
    subscriptions: Array<AsyncSubscription>;
}

export type DepArgs<M> = {
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<M>;
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
    getDeps(deps: ?Deps, dep: Dependency, tags: Array<string>): DepArgs;
    resolveAnnotation(annotation: AnyAnnotation): AnyDep;
    resolve(annotatedDep: Dependency): AnyDep;
    addRelation(id: DepId): void;
    begin(dep: AnyDep): void;
    end<T: AnyDep>(dep: T): void; // eslint-disable-line
    newRoot(): AnnotationResolver;
}
