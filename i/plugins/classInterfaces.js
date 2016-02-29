/* @flow */

import type {
    Deps,
    DepAnnotation
} from 'reactive-di/i/annotationInterfaces'
import type {DepBase} from 'reactive-di/i/nodeInterfaces'

export type ClassAnnotation<V: Object> = DepAnnotation<Class<V>> & {
    kind: 'class';
}

export type ClassDep<V: Object> = {
    kind: 'class';
    base: DepBase;
    resolve(): V;
}
