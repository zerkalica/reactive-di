/* @flow */

import type {AnnotationBase, Dependency} from '../../interfaces/annotationInterfaces'
import type {DepBase} from '../../interfaces/nodeInterfaces'
import type {EntityMeta, MetaSource} from '../asyncmodel/asyncmodelInterfaces'

export type MetaAnnotation<V> = {
    kind: 'meta';
    base: AnnotationBase<Dependency<V>>;
}

export type MetaDep<E> = {
    kind: 'meta';
    base: DepBase;
    sources: Array<MetaSource>;
    resolve(): EntityMeta<E>;
}
