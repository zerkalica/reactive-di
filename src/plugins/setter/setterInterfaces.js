/* @flow */

import type {
    Deps,
    DepFn,
    AnnotationBase,
    Dependency
} from '../../interfaces/annotationInterfaces'
import type {DepBase, DepArgs} from '../../interfaces/nodeInterfaces'
import type {Observable} from '../../interfaces/observableInterfaces'
import type {
    FactoryDep,
    Invoker
} from '../factory/factoryInterfaces'

export type SetterResult<V> = Promise<V> | V;

export type SetterInvoker<V> = Invoker<DepFn<SetterResult<V>>, FactoryDep>;
export type SetterDep<V: Object, E> = {
    kind: 'setter';
    base: DepBase;
    resolve(): (...args: any) => void;
    setDepArgs(depArgs: DepArgs): void;
}

export type SetterAnnotation<V: Object> = {
    kind: 'setter';
    base: AnnotationBase<DepFn<SetterResult<V>>>;
    deps: ?Deps;
    model: Class<V>;
}
