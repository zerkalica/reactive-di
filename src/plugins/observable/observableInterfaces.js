/* @flow */

import type {
    DepFn,
    Deps,
    AnnotationBase,
    Dependency
} from '../../interfaces/annotationInterfaces'
import type {SimpleMap} from '../../interfaces/modelInterfaces'
import type {DepBase} from '../../interfaces/nodeInterfaces'
import type {StatefullObservable} from '../../interfaces/observableInterfaces'

export type ObservableAnnotation<V> = {
    kind: 'observable';
    base: AnnotationBase<DepFn<V>>;
    deps: ?Deps;
}

export type ObservableDep<V, E> = {
    kind: 'observable';
    base: DepBase;
    resolve(): StatefullObservable<V, E>;
}
