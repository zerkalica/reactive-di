/* @flow */

import type {
    DepFn,
    Deps,
    DepItem,
    Annotation
} from 'reactive-di/i/annotationInterfaces'
import type {DepBase} from 'reactive-di/i/nodeInterfaces'

import type {StatefullObservable} from 'reactive-di/i/statefullObservable'

type MapFn<V: Object> = (value: V) => V;

export type ObservableAnnotation<V: Object> = Annotation<MapFn<V>> & {
    kind: 'observable';
    deps: DepItem;
}

export type ObservableDep<V, E> = {
    kind: 'observable';
    base: DepBase;
    resolve(): StatefullObservable<V, E>;
}
