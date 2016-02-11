/* @flow */

import type {
    Deps,
    AnnotationBase
} from '../../interfaces/annotationInterfaces'
import type {DepBase} from '../../interfaces/nodeInterfaces'
import type {Invoker} from '../factory/factoryInterfaces'

export type ClassAnnotation<V: Object> = {
    kind: 'class';
    base: AnnotationBase<Class<V>>; // eslint-disable-line
    deps: ?Deps;
}

export type ClassInvoker<V> = Invoker<Class<V>, ClassDep>;  // eslint-disable-line
export type ClassDep<V: Object> = {
    kind: 'class';
    base: DepBase;
    resolve(): V;
}
