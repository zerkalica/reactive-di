/* @flow */
import type {AnnotationResolver} from './resolver/resolverInterfaces'
import type {AnyDep, DepProcessor} from './nodes/nodeInterfaces'
import type {Dependency} from './annotations/annotationInterfaces'

export type Plugin<Annotation, Dep> = {
    annotate(target: Dependency): Annotation;
    resolve(dep: Dep, acc: DepProcessor): void;
    create(annotation: Annotation, acc: AnnotationResolver): void;
    finalize(dep: Dep, target: AnyDep): void;
}
export type FinalizeFn<T> = (dep: T, target: AnyDep) => void;
