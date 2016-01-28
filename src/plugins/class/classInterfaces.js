/* @flow */

import type {AnnotationBase, Dependency} from '../../annotations/annotationInterfaces'
import type {DepBase} from '../../nodes/nodeInterfaces'
import type {Deps, Invoker} from '../factory/factoryInterfaces'

export type ClassInvoker<V> = Invoker<Class<V>, ClassDep>;
export type ClassDep<V: Object> = {
    kind: 'class';
    base: DepBase<V>;
    invoker: ClassInvoker<V>;
}

export type ClassAnnotation<V: Object> = {
    kind: 'class';
    base: AnnotationBase<Class<V>>;
    deps: ?Deps;
}
