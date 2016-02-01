/* @flow */

import type {
    Deps,
    AnnotationBase,
    Dependency
} from '../../interfaces/annotationInterfaces'
import type {DepArgs, DepBase} from '../../interfaces/nodeInterfaces'
import type {Observable} from '../../interfaces/observableInterfaces'
import type {Invoker} from '../factory/factoryInterfaces'
import type {FactoryInvoker} from '../factory/factoryInterfaces'
import type {MetaDep} from '../meta/metaInterfaces'
import type {Loader, EntityMeta} from '../asyncmodel/asyncmodelInterfaces'

export type LoaderAnnotation<V: Object, E> = {
    kind: 'loader';
    base: AnnotationBase<Loader<V, E>>;
    deps: ?Deps;
}
export type LoaderInvoker<V: Object, E> = FactoryInvoker<Observable<V, E>>;
export type LoaderDep<V: Object, E> = {
    kind: 'loader';
    base: DepBase;
    resolve(): Observable<V, E>;
    setDepArgs(depArgs: DepArgs, meta: MetaDep<E>): void;
}
