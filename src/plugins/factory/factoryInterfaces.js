/* @flow */

import type {
    AnnotationBase,
    DepItem,
    DepFn,
    Deps
} from 'reactive-di/i/annotationInterfaces'
import type {DepBase} from 'reactive-di/i/nodeInterfaces'
import type {DepArgs} from 'reactive-di/i/nodeInterfaces'

export type Hooks<T> = {
    onUnmount: () => void;
    onMount: () => void;
    onUpdate: (currentValue: T, nextValue: T) => void;
}

export type FactoryAnnotation<V> = {
    kind: 'factory';
    base: AnnotationBase<DepFn<V>>;
    deps: ?Deps;
}

export type Invoker<V, M> = {
    target: V;
    depArgs: DepArgs<M>;
}

export type FactoryInvoker<V> = Invoker<DepFn<V>, FactoryDep>;
export type FactoryDep<V: any> = {
    kind: 'factory';
    base: DepBase;
    resolve(): V;
}

export type FactoryAnnotator = (...deps: Array<DepItem>) => <T: DepFn>(target: T) => T; // eslint-disable-line
