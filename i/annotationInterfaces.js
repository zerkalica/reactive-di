/* @flow */

import type {SimpleMap} from 'reactive-di/i/modelInterfaces'
import type {ClassAnnotation} from 'reactive-di/i/plugins/classInterfaces'
import type {FactoryAnnotation} from 'reactive-di/i/plugins/factoryInterfaces'
import type {GetterAnnotation} from 'reactive-di/i/plugins/getterInterfaces'
import type {LoaderAnnotation, ResetAnnotation} from 'reactive-di/i/plugins/loaderInterfaces'
import type {MetaAnnotation} from 'reactive-di/i/plugins/metaInterfaces'
import type {ModelAnnotation} from 'reactive-di/i/plugins/modelInterfaces'
import type {ObservableAnnotation} from 'reactive-di/i/plugins/observableInterfaces'
import type {
    AsyncSetterAnnotation,
    SyncSetterAnnotation
} from 'reactive-di/i/plugins/setterInterfaces'

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

export type Annotation<T> = {
    kind: any;
    target: T;
    id: DepId;
}

export type DepAnnotation<T> = Annotation<T> & {
    deps: Array<DepItem>;
}

export type AnnotationDriver = {
    hasAnnotation(dep: Dependency): boolean;
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
    | ObservableAnnotation
    | LoaderAnnotation
    | ResetAnnotation
    | AsyncSetterAnnotation
    | SyncSetterAnnotation;
