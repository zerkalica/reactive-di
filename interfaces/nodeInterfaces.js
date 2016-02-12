/* @flow */

import type {AsyncModelDep} from '../plugins/asyncmodel/asyncmodelInterfaces'
import type {ClassDep} from '../plugins/class/classInterfaces'
import type {FactoryDep} from '../plugins/factory/factoryInterfaces'
import type {GetterDep} from '../plugins/getter/getterInterfaces'
import type {LoaderDep, ResetDep} from '../plugins/loader/loaderInterfaces'
import type {MetaDep} from '../plugins/meta/metaInterfaces'
import type {ModelDep} from '../plugins/model/modelInterfaces'
import type {SetterDep} from '../plugins/setter/setterInterfaces'
import type {
    Info,
    DepId,
    Dependency,
    Deps,
    AnyAnnotation
} from './annotationInterfaces'
import type {CursorCreator, Notify} from './modelInterfaces'

export type AnyDep =
    ClassDep
    | FactoryDep
    | MetaDep
    | AsyncModelDep
    | ModelDep
    | LoaderDep
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
    isRecalculate: boolean;
    id: DepId;

    info: Info;
    relations: Array<DepId>;
    subscriptions: Array<AsyncSubscription>;
}

export type DepArgs<M> = {
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<M>;
}

export type AnnotationResolver = {
    createCursor: CursorCreator;
    notify: Notify;
    getDeps(deps: ?Deps, dep: Dependency, tags: Array<string>): DepArgs;
    resolveAnnotation(annotation: AnyAnnotation): AnyDep;
    resolve(annotatedDep: Dependency): AnyDep;
    addRelation(id: DepId): void;
    begin(dep: AnyDep): void;
    end<T: AnyDep>(dep: T): void; // eslint-disable-line
    newRoot(): AnnotationResolver;
}
