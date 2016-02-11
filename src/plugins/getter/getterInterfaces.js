/* @flow */

import type {AnnotationBase} from '../../interfaces/annotationInterfaces'
import type {DepBase} from '../../interfaces/nodeInterfaces'

export type GetterAnnotation<V: Object> = {
    kind: 'getter';
    base: AnnotationBase<Class<V>>; // eslint-disable-line
}
export type Getter<V: Object> = () => V;

export type GetterDep<V: Object> = {
    kind: 'getter';
    base: DepBase;
    resolve: () => Getter<V>;
}
