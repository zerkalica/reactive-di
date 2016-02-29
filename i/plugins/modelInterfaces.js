/* @flow */

import type {
    Annotation,
    Dependency
} from 'reactive-di/i/annotationInterfaces'
import type {FromJS} from 'reactive-di/i/modelInterfaces'
import type {
    DepBase,
    Cacheable
} from 'reactive-di/i/nodeInterfaces'

export type ModelAnnotation<V: Object> = Annotation<Class<V>> & {
    kind: 'model';
    childs: Array<Class<*>>;
    statePath: Array<string>;
    fromJS: FromJS<V>;
}

export type ModelDep<V: Object> = {
    kind: 'model';
    base: DepBase;
    reset(): void;
    resolve(): V;
    setFromJS(value: Object): void;
    set(value: V): boolean;
    dataOwners: Array<Cacheable>;
}
