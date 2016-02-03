/* @flow */

import type {
    Deps,
    DepFn,
    AnnotationBase,
    Dependency
} from '../../interfaces/annotationInterfaces'
import type {DepBase, DepArgs} from '../../interfaces/nodeInterfaces'
import type {Observable} from '../../interfaces/observableInterfaces'
import type {AsyncUpdater} from '../asyncmodel/asyncmodelInterfaces'
import type {
    FactoryDep,
    Invoker
} from '../factory/factoryInterfaces'
import type {MetaDep} from '../meta/metaInterfaces'
import type {SetterDep} from '../setter/setterInterfaces'

export type LoaderDep<V: Object, E> = {
    kind: 'loader';
    base: DepBase;
    resolve(): V;
}

export type LoaderAnnotation<V: Object, E> = {
    kind: 'loader';
    base: AnnotationBase<Class<V>>;
    setter: AsyncUpdater<V, E>;
}
