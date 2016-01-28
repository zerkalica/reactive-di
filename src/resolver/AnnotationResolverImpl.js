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
    ClassDep
} from '../nodes/nodeInterfaces'
import type {
    ResolverType,
    CacheBuilderInfo,
    ResolverTypeMap,
    DependencyResolver,
    AnnotationResolver
} from './resolverInterfaces'
import type {
    Notifier,
    SimpleMap,
    Cursor,
    CursorCreator
} from '../modelInterfaces'

// implements DependencyResolver, AnnotationResolver
export default class AnnotationResolverImpl {
    driver: AnnotationDriver;
    resolvers: SimpleMap<string, ResolverType>;
    middlewares: SimpleMap<DepId|string, Array<Dependency>>;
    createCursor: CursorCreator;
    notifier: Notifier;

    builderInfo: CacheBuilderInfo;

    constructor(
        driver: AnnotationDriver,
        resolvers: SimpleMap<string, ResolverType>,
        middlewares: SimpleMap<DepId|string, Array<Dependency>>,
        createCursor: CursorCreator,
        notifier: Notifier
    ) {
        this.driver = driver
        this.resolvers = resolvers
        this.builderInfo = {
            cache: {},
            parents: []
        }
        this.middlewares = middlewares
        this.createCursor = this.createCursor
        this.notifier = notifier
    }
}
