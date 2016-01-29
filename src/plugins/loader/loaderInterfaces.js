/* @flow */

import type {
    Deps,
    AnnotationBase,
    Dependency
} from '../../annotationInterfaces'
import type {DepBase} from '../../nodeInterfaces'
import type {Observable} from '../../observableInterfaces'
import type {Invoker} from '../factory/factoryInterfaces'
import type {FactoryInvoker} from '../factory/factoryInterfaces'
import type {Loader} from '../model/modelInterfaces'

export type LoaderAnnotation<V: Object, E> = {
    kind: 'loader';
    base: AnnotationBase<Loader<V, E>>;
    deps: ?Deps;
}

export type LoaderDep<V: Object, E> = {
    kind: 'loader';
    base: DepBase<V>;
    invoker: FactoryInvoker<Observable<V, E>>;
}
