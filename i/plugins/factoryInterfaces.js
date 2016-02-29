/* @flow */

import type {
    DepAnnotation,
    DepFn
} from 'reactive-di/i/annotationInterfaces'
import type {DepBase} from 'reactive-di/i/nodeInterfaces'

export type FactoryAnnotation<V> = DepAnnotation<DepFn<V>> & {
    kind: 'factory';
}

export type FactoryDep<V: any> = {
    kind: 'factory';
    base: DepBase;
    resolve(): V;
}
