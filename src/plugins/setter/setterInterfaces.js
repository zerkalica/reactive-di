/* @flow */

import type {
    DepFn,
    AnnotationBase,
    Dependency
} from '../../annotationInterfaces'
import type {DepBase} from '../../nodeInterfaces'
import type {Observable} from '../../observableInterfaces'
import type {
    FactoryDep,
    Deps,
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
}

export type SetterAnnotation<V: Object> = {
    kind: 'setter';
    base: AnnotationBase<DepFn<Setter<V>>>;
    deps: ?Deps;
    model: Class<V>;
}
