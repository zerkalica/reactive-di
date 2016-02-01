/* @flow */

import type {
    Deps,
    AnnotationBase,
    Dependency
} from '../../interfaces/annotationInterfaces'
import type {DepArgs, DepBase} from '../../interfaces/nodeInterfaces'
import type {Invoker} from '../factory/factoryInterfaces'

export type ClassAnnotation<V: Object> = {
    kind: 'class';
    base: AnnotationBase<Class<V>>;
    deps: ?Deps;
}

export type ClassInvoker<V> = Invoker<Class<V>, ClassDep>;
export type ClassDep<V: Object> = {
    kind: 'class';
    base: DepBase;
    resolve(): V;
    setDepArgs(depArgs: DepArgs): void;
}
