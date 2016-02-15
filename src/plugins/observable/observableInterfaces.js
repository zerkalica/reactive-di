/* @flow */

import type {AnnotationBase, Dependency} from '../../interfaces/annotationInterfaces'
import type {DepBase} from '../../interfaces/nodeInterfaces'
import type {SimpleMap} from '../../interfaces/modelInterfaces'
import type {StatefullObservable} from '../../interfaces/observableInterfaces'

export type ObservableAnnotation<V: SimpleMap<string, Dependency>> = {
    kind: 'observable';
    base: AnnotationBase<V>;
}

export type ObservableDep<E> = {
    kind: 'observable';
    base: DepBase;
    resolve: () => EntityMeta<E>;
}
