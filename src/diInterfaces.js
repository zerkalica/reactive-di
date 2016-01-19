/* @flow */

import type {Dependency} from './annotations/annotationInterfaces'
import type {
    ClassDep,
    FactoryDep
} from './nodes/nodeInterfaces'

export type ReactiveDi = {
    mount<D: ClassDep|FactoryDep>(annotatedDep: Dependency): () => void;
    get(annotatedDep: Dependency): any;
}
