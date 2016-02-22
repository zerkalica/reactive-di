/* @flow */

import type {
    Deps,
    AnnotationBase
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

export type LoaderAnnotation<V: Object, E> = {
    kind: 'loader';
    base: AnnotationBase<AsyncUpdater<V, E>>;
    deps: ?Deps;
    model: Class<V>;
}

export type ResetAnnotation<V: Object, E> = {
    kind: 'reset';
    base: AnnotationBase<AsyncUpdater<V, E>>;
}
