/* @flow */

import type {
    Deps,
    AnnotationBase
} from 'reactive-di/i/annotationInterfaces'
import type {DepBase} from 'reactive-di/i/nodeInterfaces'
import type {
    AnyUpdater,
    AsyncModelDep
} from 'reactive-di/plugins/asyncmodel/asyncmodelInterfaces'
import type {ModelDep} from 'reactive-di/plugins/model/modelInterfaces'

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
