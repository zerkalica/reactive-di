/* @flow */

import type {
    Deps,
    AnnotationBase
} from '../../interfaces/annotationInterfaces'
import type {DepBase} from '../../interfaces/nodeInterfaces'
import type {
    AnyUpdater,
    AsyncModelDep
} from '../asyncmodel/asyncmodelInterfaces'
import type {ModelDep} from '../model/modelInterfaces'

export type AnyModelDep<V, E> = ModelDep<V>|AsyncModelDep<V, E>;

export type SetFn = (...args: any) => void;
export type SetterCreator = (model: AnyModelDep) => SetFn;

export type SetterDep = {
    kind: 'setter';
    base: DepBase;
    unsubscribe(): void;
    resolve(): SetFn;
}

export type SetterAnnotation<V: Object, E> = {
    kind: 'setter';
    base: AnnotationBase<AnyUpdater<V, E>>;
    deps: ?Deps;
    model: Class<V>; // eslint-disable-line
}
