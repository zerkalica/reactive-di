/* @flow */

import type {Dependency} from 'reactive-di/i/annotationInterfaces'
import type {
    AnyDep,
    AnnotationResolver
} from 'reactive-di/i/nodeInterfaces'

export interface Plugin<Annotation: Object, Dep: Object> {
    create(annotation: Annotation, acc: AnnotationResolver): void;
    finalize(dep: Dep, target: AnyDep): void;
}

export type Resolve = (dep: AnyDep) => void;
export type FinalizeFn<T> = (dep: T, target: AnyDep) => void;
