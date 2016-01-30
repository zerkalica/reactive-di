/* @flow */

import type {
    Deps,
    DepFn,
    AnnotationBase,
    Dependency
} from '../../interfaces/annotationInterfaces'
import type {DepBase} from '../../interfaces/nodeInterfaces'
import type {Observable} from '../../interfaces/observableInterfaces'
import type {
    FactoryDep,
    Invoker
} from '../factory/factoryInterfaces'

export type SetterResult<V> = Promise<V> | V;
export type Setter<V> = DepFn<SetterResult<V>>;

export type SetterInvoker<V> = Invoker<DepFn<Setter<V>>, FactoryDep>;
export type SetterDep<V: Object, E> = {
    kind: 'setter';
    base: DepBase<Setter<V>>;
    invoker: SetterInvoker<V>;
    set: (value: V|Observable<V, E>) => void;
    resolve: () => void;
}

export type SetterAnnotation<V: Object> = {
    kind: 'setter';
    base: AnnotationBase<DepFn<Setter<V>>>;
    deps: ?Deps;
    model: Class<V>;
}
