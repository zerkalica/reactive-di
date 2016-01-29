/* @flow */

import type {Observable} from './observableInterfaces'
import type {FromJS, SimpleMap} from './modelInterfaces'

export type DepId = string;
export type Tag = string;
export type DepFn<T> = (...x: any) => T;
export type Dependency<T> = DepFn<T>|Class<T>;
export type Deps = Array<Dependency | SimpleMap<string, Dependency>>;

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

export type AnyAnnotation = {

};

export type AnnotationDriver = {
    get<T: Dependency, A: AnyAnnotation>(dep: T): A;
    set<T: Dependency, A: AnyAnnotation>(dep: T, annotation: A): T;
};

export type Annotations = {
}
