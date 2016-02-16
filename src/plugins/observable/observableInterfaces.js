/* @flow */

import type {
    DepFn,
    Deps,
    AnnotationBase
} from 'reactive-di/i/annotationInterfaces'
import type {DepBase} from 'reactive-di/i/nodeInterfaces'

import type {StatefullObservable} from 'reactive-di/i/statefullObservable'

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
