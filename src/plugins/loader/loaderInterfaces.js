/* @flow */

import type {
    Deps,
    AnnotationBase
} from '../../interfaces/annotationInterfaces'
import type {DepBase} from '../../interfaces/nodeInterfaces'
import type {AsyncUpdater} from '../asyncmodel/asyncmodelInterfaces'

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
    model: Class<V>; // eslint-disable-line
}

export type ResetAnnotation<V: Object, E> = {
    kind: 'reset';
    base: AnnotationBase<AsyncUpdater<V, E>>;
}
