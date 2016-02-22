/* @flow */

import type {
    Deps,
    AnnotationBase
} from 'reactive-di/i/annotationInterfaces'
import type {DepBase} from 'reactive-di/i/nodeInterfaces'

export type ClassAnnotation<V: Object> = {
    kind: 'class';
    base: AnnotationBase<Class<V>>;
    deps: ?Deps;
}

export type ClassDep<V: Object> = {
    kind: 'class';
    base: DepBase;
    resolve(): V;
}
