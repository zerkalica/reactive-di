/* @flow */

import type {
    AnnotationBase,
    DepItem,
    DepFn,
    Deps
} from 'reactive-di/i/annotationInterfaces'
import type {DepBase} from 'reactive-di/i/nodeInterfaces'
import type {DepArgs} from 'reactive-di/i/nodeInterfaces'

export type FactoryAnnotation<V> = {
    kind: 'factory';
    base: AnnotationBase<DepFn<V>>;
    deps: ?Deps;
}

export type FactoryDep<V: any> = {
    kind: 'factory';
    base: DepBase;
    resolve(): V;
}
