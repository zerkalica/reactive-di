/* @flow */

import type {
    Info,
    DepId,
    Dependency,
    Deps
} from './annotationInterfaces'
import type {Subscription} from './observableInterfaces'
import type {CursorCreator, Notify} from './modelInterfaces'

import type {ClassDep} from './plugins/class/classInterfaces'
import type {FactoryDep} from './plugins/factory/factoryInterfaces'
import type {LoaderDep} from './plugins/loader/loaderInterfaces'
import type {MetaDep} from './plugins/meta/metaInterfaces'
import type {ModelDep} from './plugins/model/modelInterfaces'
import type {SetterDep} from './plugins/setter/setterInterfaces'


export type AnyDep = ClassDep | FactoryDep | MetaDep | ModelDep | SetterDep;

export type Cacheable = {
    isRecalculate: boolean;
};

export type DepBase<V> = {
    isRecalculate: boolean;
    value: V;
    relations: Array<DepId>;
    id: DepId;
    info: Info;
    subscriptions: Array<Subscription>;
    resolve: () => void;
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
    resolve(annotatedDep: Dependency): AnyDep;
    addRelation(id: DepId): void;
    begin(dep: AnyDep): void;
    end<T: AnyDep>(dep: T): void;
    newRoot(): AnnotationResolver;
}

export type ReactiveDi =  {
    get(annotatedDep: Dependency): any;
    subscribe(annotatedDep: Dependency): Subscription;
}
