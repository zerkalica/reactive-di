/* @flow */

import type {Dependency} from './annotations/annotationInterfaces'
import type {
    AnyDep,
    ClassDep,
    FactoryDep
} from './nodes/nodeInterfaces'

export type ReactiveDi = {
    mount<V, E, V: AnyDep<V, E>>(annotatedDep: V): () => void;
    get<V, E, D: AnyDep<V, E>>(annotatedDep: D): V;
}
