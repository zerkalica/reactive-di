/* @flow */

import type {AnnotationBase, Dependency} from '../../annotations/annotationInterfaces'
import type {DepBase} from '../../nodes/nodeInterfaces'
import type {EntityMeta, AsyncUpdater} from '../model/modelInterfaces'

export type MetaAnnotation<V> = {
    kind: 'meta';
    base: AnnotationBase<Dependency<V>>;
}

export type MetaDep<E> = {
    kind: 'meta';
    base: DepBase<EntityMeta<E>>;
    sources: Array<AsyncUpdater>;
}
