/* @flow */

import type {Dependency} from 'reactive-di/i/annotationInterfaces'
import type {
    AnnotationResolver
} from 'reactive-di/i/nodeInterfaces'

export interface Plugin<Annotation: Object, Dep: Object> {
    kind: any;

    create(annotation: Annotation, acc: AnnotationResolver): void;
    finalize<AnyDep: Object>(dep: Dep, target: AnyDep): void;
}
