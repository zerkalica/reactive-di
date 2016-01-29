/* @flow */

import type {AnnotationBase, Dependency} from '../../annotationInterfaces'
import type {DepBase} from '../../nodeInterfaces'
import type {Deps, Invoker} from '../factory/factoryInterfaces'
import type {Loader} from '../model/modelInterfaces'

export type LoaderAnnotation<V: Object, E> = {
    kind: 'loader';
    base: AnnotationBase<Loader<V, E>>;
    deps: ?Deps;
}
