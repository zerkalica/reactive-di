/* @flow */

import type {Dependency} from './annotations/annotationInterfaces'
import type {
    AnyDep,
    ClassDep,
    FactoryDep
} from './nodes/nodeInterfaces'

export type ReactiveDi = {
    mount<R: any, T: Dependency<R>, D: ClassDep<R>|FactoryDep<T>>(annotatedDep: T): () => void;
    get<R: any, T: Dependency<R>, D: AnyDep<R, T>>(annotatedDep: T): R;
}
