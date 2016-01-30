/* @flow */

import type {
    Deps,
    AnnotationBase,
    Dependency
} from '../../interfaces/annotationInterfaces'
import type {DepBase} from '../../interfaces/nodeInterfaces'
import type {Observable} from '../../interfaces/observableInterfaces'
import type {Invoker} from '../factory/factoryInterfaces'
import type {FactoryInvoker} from '../factory/factoryInterfaces'
import type {Loader, EntityMeta} from '../model/modelInterfaces'

export type LoaderAnnotation<V: Object, E> = {
    kind: 'loader';
    base: AnnotationBase<Loader<V, E>>;
    deps: ?Deps;
}
export type LoaderInvoker<V: Object, E> = FactoryInvoker<Observable<V, E>>;
export type LoaderDep<V: Object, E> = {
    kind: 'loader';
    base: DepBase<Observable<V, E>>;
    meta: DepBase<EntityMeta<E>>;
    invoker: LoaderInvoker<V, E>;
}
