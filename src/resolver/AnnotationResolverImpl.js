/* @flow */

import createId from '../utils/createId'
import type {
    DepId,
    Tag,
    Dependency,
    AnnotationDriver,
    AnyAnnotation
} from '../annotations/annotationInterfaces'
import type {
    AnyDep,
    FactoryDep,
    ClassDep,
    Notifier,
    Relations
} from '../nodes/nodeInterfaces'
import type {
    ResolverTypeMap,
    DependencyResolver,
    AnnotationResolver
} from './resolverInterfaces'
import type {
    SimpleMap,
    Cursor,
    CursorCreator
} from '../modelInterfaces'

// implements DependencyResolver, AnnotationResolver
export default class AnnotationResolverImpl {
    parents: Array<Set<DepId>>;
    cache: SimpleMap<DepId, AnyDep>;
}
