/* @flow */

import type {Dependency} from './annotationInterfaces'
import type {
    AnyDep,
    DependencyResolver
} from './nodeInterfaces'
import type {AnnotationResolver} from './resolverInterfaces'

export type Plugin<Annotation, Dep> = {
    resolve(dep: Dep, acc: DependencyResolver): void;
    create(annotation: Annotation, acc: AnnotationResolver): void;
    finalize(dep: Dep, target: AnyDep): void;
}
export type FinalizeFn<T> = (dep: T, target: AnyDep) => void;
