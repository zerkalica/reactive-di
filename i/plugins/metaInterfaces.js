/* @flow */

import type {AnnotationBase, Dependency} from 'reactive-di/i/annotationInterfaces'
import type {DepBase} from 'reactive-di/i/nodeInterfaces'
import type {EntityMeta, MetaSource} from 'reactive-di/i/plugins/asyncmodelInterfaces'

export type MetaAnnotation<V> = {
    kind: 'meta';
    base: AnnotationBase<Dependency<V>>;
}

export type MetaDep<E> = {
    kind: 'meta';
    base: DepBase;
    promise: Promise<any>;
    sources: Array<MetaSource>;
    resolve: () => EntityMeta<E>;
}
