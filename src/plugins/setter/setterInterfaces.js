/* @flow */

import type {
    Deps,
    DepFn,
    AnnotationBase,
    Dependency
} from '../../interfaces/annotationInterfaces'
import type {DepBase, DepArgs} from '../../interfaces/nodeInterfaces'
import type {Observable} from '../../interfaces/observableInterfaces'
import type {Loader} from '../asyncmodel/asyncmodelInterfaces'
import type {
    FactoryDep,
    Invoker
} from '../factory/factoryInterfaces'
import type {MetaDep} from '../meta/metaInterfaces'

export type SetterInvoker<V, E> = Invoker<Loader<V, E>, FactoryDep>;
export type SetterDep<V: Object, E> = {
    kind: 'setter';
    base: DepBase;
    resolve(): (...args: any) => void;
    setDepArgs(depArgs: DepArgs, metaDep: MetaDep<E>): void;
}

export type SetterAnnotation<V: Object, E> = {
    kind: 'setter';
    base: AnnotationBase<Loader<V, E>>;
    deps: ?Deps;
    model: Class<V>;
}
