/* @flow */
/* eslint-disable no-undef, no-unused-vars */

import type {
    Dependency,
    DepId,
    AnyAnnotation
} from '../annotations/annotationInterfaces'
import type {AnyDep} from '../nodes/nodeInterfaces'

export type Middlewares = {[id: DepId]: Array<Dependency>};

export type AnnotationResolver = {
    begin<A: any, T: Dependency<A>, R: AnyDep<A, T>>(dep: R): void;
    end<A: any, T: Dependency<A>, R: AnyDep<A, T>>(dep: R): void;
    resolve<A: any, T: Dependency<A>, R: AnyDep<A, T>>(annotatedDep: T): R;
    middlewares: Middlewares;
}

export type DependencyResolver = {
    get<A: any, T: Dependency<A>, R: AnyDep<A, T>>(annotatedDep: T): R;
}

export type ResolverType<A: AnyAnnotation> = (annotation: A, acc: AnnotationResolver) => void;
export type ResolverTypeMap = {[kind: string]: ResolverType};
