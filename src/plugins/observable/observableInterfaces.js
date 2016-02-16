/* @flow */

import type {
    DepFn,
    Deps,
    AnnotationBase
} from '../../interfaces/annotationInterfaces'
import type {DepBase} from '../../interfaces/nodeInterfaces'

export type ObservableAnnotation<V> = {
    kind: 'observable';
    base: AnnotationBase<DepFn<V>>;
    deps: Deps;
}

export type ObservableDep<V, E> = {
    kind: 'observable';
    base: DepBase;
    resolve(): StatefullObservable<V, E>;
}
