/* @flow */

import type {
    Annotation,
    Dependency
} from 'reactive-di/i/annotationInterfaces'
import type {
    DepBase,
    EntityMeta,
    Cacheable
} from 'reactive-di/i/nodeInterfaces'

export type MetaSource<E> = {
    meta: EntityMeta<E>;
    metaOwners: Array<Cacheable>;
}

export type MetaAnnotation<V> = Annotation<Dependency<V>> & {
    kind: 'meta';
}

export type MetaDep<E> = {
    kind: 'meta';
    base: DepBase;
    sources: Array<MetaSource>;
    resolve: () => EntityMeta<E>;
}
