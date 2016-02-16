/* @flow */

import type {AnnotationBase} from 'reactive-di/i/annotationInterfaces'
import type {DepBase} from 'reactive-di/i/nodeInterfaces'

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
