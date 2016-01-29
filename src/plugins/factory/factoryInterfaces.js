/* @flow */

import type {AnnotationBase, Dependency} from '../../annotationInterfaces'
import type {
    DepFn,
    Deps
} from '../../annotationInterfaces'
import type {SimpleMap} from '../../modelInterfaces'
import type {
    DepBase,
    AnyDep
} from '../../nodeInterfaces'
import type {DepArgs} from '../../nodeInterfaces'

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

export type Hooks<T> = {
    onUnmount: () => void;
    onMount: () => void;
    onUpdate: (currentValue: T, nextValue: T) => void;
}
