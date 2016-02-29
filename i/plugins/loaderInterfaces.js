/* @flow */

import type {
    Deps,
    DepAnnotation,
    Annotation
} from 'reactive-di/i/annotationInterfaces'
import type {DepBase} from 'reactive-di/i/nodeInterfaces'
import type {AsyncUpdater} from 'reactive-di/i/plugins/setterInterfaces'

export type LoaderDep<V: Object> = {
    kind: 'loader';
    base: DepBase;
    resolve(): V;
    reset(): void;
}

export type ResetDep = {
    kind: 'reset';
    base: DepBase;
    resolve(): () => void;
}

export type LoaderAnnotation<V: Object, E> = DepAnnotation<AsyncUpdater<V, E>> & {
    kind: 'loader';
    model: Class<V>;
}

export type ResetAnnotation<V: Object, E> = Annotation<AsyncUpdater<V, E>> & {
    kind: 'reset';
}
