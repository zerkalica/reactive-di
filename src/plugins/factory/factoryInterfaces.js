/* @flow */

import type {AnnotationBase, Dependency} from '../../annotations/annotationInterfaces'
import type {
    DepFn
} from '../../annotations/annotationInterfaces'
import type {SimpleMap} from '../../modelInterfaces'
import type {
    DepBase,
    AnyDep
} from '../../nodes/nodeInterfaces'

export type Deps = Array<Dependency | SimpleMap<string, Dependency>>;

export type DepArgs<M> = {
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<M>;
}

export type Invoker<V, M> = {
    target: V;
    depArgs: DepArgs<M>;
}

export type FactoryInvoker<V> = Invoker<DepFn<V>, FactoryDep>;
export type FactoryDep<V: any> = {
    kind: 'factory';
    base: DepBase<V>;
    invoker: FactoryInvoker<V>;
}

export type FactoryAnnotation<V> = {
    kind: 'factory';
    base: AnnotationBase<DepFn<V>>;
    deps: ?Deps;
}
