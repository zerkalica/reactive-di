/* @flow */
/* eslint-disable no-undef, no-unused-vars */

import type {DepId, AnyAnnotation} from '../annotations/annotationInterfaces'
import type {AnyDep} from '../nodes/nodeInterfaces'

export type AnnotationResolver = {
    begin<T: AnyDep>(dep: T): void;
    end<T: AnyDep>(dep: T): void;
    resolve<T: AnyDep, D: Function>(annotatedDep: D): T;
}

export type DependencyResolver = {
    get<T: AnyDep, D: Function>(annotatedDep: D): T;
}

export type ResolverType<A: AnyAnnotation> = (annotation: A, acc: AnnotationResolver) => void;
export type ResolverTypeMap = {[kind: string]: ResolverType};
export type Middlewares = {[id: DepId]: Array<Function>};
