/* @flow */

import type {Dependency} from './annotationInterfaces'
import type {
    AnyDep,
    AnnotationResolver
} from './nodeInterfaces'

export type Plugin<Annotation, Dep> = {
    resolve(dep: Dep): void;
    create(annotation: Annotation, acc: AnnotationResolver): void;
    finalize(dep: Dep, target: AnyDep): void;
}

export type Resolve = (dep: AnyDep) => void;
export type FinalizeFn<T> = (dep: T, target: AnyDep) => void;
