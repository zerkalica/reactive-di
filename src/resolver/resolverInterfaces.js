/* @flow */
/* eslint-disable no-undef, no-unused-vars */

import type {AnyAnnotation} from '../annotations/annotationInterfaces'
import type {DepId} from '../interfaces'
import type {AnyDep} from '../nodes/nodeInterfaces'

export type AnnotationResolver = {
    begin<T: AnyDep>(dep: T): void;
    end<T: AnyDep>(dep: T): void;
    resolve<T: AnyDep, D: Function>(annotatedDep: D): T;
}

export type Resolver<A: AnyAnnotation> = (annotation: A, acc: AnnotationResolver) => void;
export type ResolverMap = {[kind: string]: Resolver};
