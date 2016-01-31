/* @flow */

import type {
    DepFn,
    AnnotationBase,
    Dependency
} from '../../interfaces/annotationInterfaces'
import type {DepBase} from '../../interfaces/nodeInterfaces'

export type GetterAnnotation<V> = {
    kind: 'getter';
    base: AnnotationBase<Dependency<V>>;
}
export type Getter<V> = () => V;

export type GetterDep<V> = {
    kind: 'getter';
    base: DepBase<Getter<V>>;
    resolve(): void;
}
