/* @flow */

import type {AnnotationBase, Dependency} from 'reactive-di/i/annotationInterfaces'
import type {
    DepBase,
    EntityMeta,
    Cacheable
} from 'reactive-di/i/nodeInterfaces'

export type MetaSource<E> = {
    meta: EntityMeta<E>;
    metaOwners: Array<Cacheable>;
}

export type MetaAnnotation<V> = {
    kind: 'meta';
    base: AnnotationBase<Dependency<V>>;
}

export type MetaDep<E> = {
    kind: 'meta';
    base: DepBase;
    sources: Array<MetaSource>;
    resolve: () => EntityMeta<E>;
}
