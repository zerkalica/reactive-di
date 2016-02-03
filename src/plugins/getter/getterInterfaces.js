/* @flow */

import type {
    DepFn,
    AnnotationBase
} from '../../interfaces/annotationInterfaces'
import type {DepBase} from '../../interfaces/nodeInterfaces'

export type GetterAnnotation<V: Object> = {
    kind: 'getter';
    base: AnnotationBase<Class<V>>;
}
export type Getter<V: Object> = () => V;

export type GetterDep<V: Object, E> = {
    kind: 'getter';
    base: DepBase;
    resolve: () => Getter<V>;
}
