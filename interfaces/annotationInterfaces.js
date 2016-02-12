/* @flow */

import type {SimpleMap} from './modelInterfaces'

import type {ClassAnnotation} from '../plugins/class/classInterfaces'
import type {FactoryAnnotation} from '../plugins/factory/factoryInterfaces'
import type {MetaAnnotation} from '../plugins/meta/metaInterfaces'
import type {ModelAnnotation} from '../plugins/model/modelInterfaces'
import type {AsyncModelAnnotation} from '../plugins/asyncmodel/asyncmodelInterfaces'
import type {SetterAnnotation} from '../plugins/setter/setterInterfaces'
import type {GetterAnnotation} from '../plugins/getter/getterInterfaces'
import type {LoaderAnnotation, ResetAnnotation} from '../plugins/loader/loaderInterfaces'

export type DepId = string;
export type Tag = string;
export type DepFn<T> = (...x: any) => T;
export type Dependency<T> = DepFn<T>|Class<T>; // eslint-disable-line

export type DepItem = Dependency|SimpleMap<string, Dependency>;
export type Deps = Array<DepItem>;

export type IdCreator = {
    createId(): string;
}

export type HooksRec<T> = {
    onUnmount?: () => void;
    onMount?: () => void;
    onUpdate?: (currentValue: T, nextValue: T) => void;
}

export type Info = {
    tags: Array<Tag>;
    displayName: string;
}

export type AnnotationBase<T> = {
    id: DepId;
    info: Info;
    target: T;
}

export type AnnotationDriver = {
    getAnnotation<V, A: AnyAnnotation>(dep: Dependency<V>): A; // eslint-disable-line
    annotate<V, T: Dependency<V>, A: AnyAnnotation>(dep: T, annotation: A): T; // eslint-disable-line
};

export type Annotations = {
}

export type AnyAnnotation =
    ClassAnnotation
    | FactoryAnnotation
    | MetaAnnotation
    | ModelAnnotation
    | GetterAnnotation
    | AsyncModelAnnotation
    | LoaderAnnotation
    | ResetAnnotation
    | SetterAnnotation;
