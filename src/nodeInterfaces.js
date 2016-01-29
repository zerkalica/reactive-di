/* @flow */

import type {
    Info,
    DepId,
    Dependency,
    Deps
} from './annotationInterfaces'
import type {Subscription} from './observableInterfaces'
import type {CursorCreator, Notifier} from './modelInterfaces'

export type AnyDep = {
};

export type Cacheable = {
    isRecalculate: boolean;
};

export type DependencyResolver = {
    get(annotatedDep: Dependency): AnyDep;
}

export type ResolveFn = (dep: AnyDep, acc: DependencyResolver) => void;

export type DepBase<V> = Cacheable & {
    isRecalculate: boolean;
    value: V;
    relations: Array<DepId>;
    id: DepId;
    info: Info;
    subscriptions: Array<Subscription>;
    resolver: ResolveFn;
}

export type DepArgs<M> = {
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<M>;
}

export type AnnotationResolver = {
    createCursor: CursorCreator;
    notifier: Notifier;
    getDeps(deps: ?Deps, id: DepId, tags: Array<string>): DepArgs;
    resolve(annotatedDep: Dependency): AnyDep;
    addRelation(id: DepId): void;
    begin(dep: AnyDep): void;
    end<T: AnyDep>(dep: T): void;
    newRoot(): AnnotationResolver;
}

export type ReactiveDi = DependencyResolver & {
    subscribe(annotatedDep: Dependency): Subscription;
}
