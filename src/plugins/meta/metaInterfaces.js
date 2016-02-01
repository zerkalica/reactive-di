/* @flow */

import type {AnnotationBase, Dependency} from '../../interfaces/annotationInterfaces'
import type {DepBase} from '../../interfaces/nodeInterfaces'
import type {EntityMeta, AsyncUpdater} from '../model/modelInterfaces'

export type MetaAnnotation<V> = {
    kind: 'meta';
    base: AnnotationBase<Dependency<V>>;
}

export type MetaDep<E> = {
    kind: 'meta';
    base: DepBase;
    sources: Array<AsyncUpdater>;
    resolve(): EntityMeta<E>;
}
