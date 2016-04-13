/* @flow */

import type {
    ProviderManager,
    Container,
    Tag,
    DependencyKey,
    Dependency,
    Annotation,
    Provider,
    Plugin,
    RelationUpdater,
    CreateContainer,
    Resolver,
    CreateContainerManager,
    ContainerManager
} from 'reactive-di/i/coreInterfaces'

declare module 'reactive-di' {
    declare class AnnotationDriver {
        annotate<Ann: Annotation>(annotatedDep: Dependency, annotation: Ann): void;
        getAnnotation(annotatedDep: Dependency): Annotation;
    }

    declare var annotationDriver: AnnotationDriver;
    declare function createConfigProvider(
        pluginsConfig?: Array<Plugin>,
        createUpdater?: () => RelationUpdater,
        createContainer?: CreateContainer
    ): CreateContainerManager;
    declare function createDefaultContainer(
        providerManager: ProviderManager,
        middlewares: Map<DependencyKey|Tag, Array<DependencyKey>>,
        parent: ?Container
    ): Container;
    declare function createHotRelationUpdater(): RelationUpdater;
    declare function createDummyRelationUpdater(): RelationUpdater;
    declare var defaultPlugins: Array<Plugin>;

    declare class SimpleMap<K, V> extends Map<K, V> {}
    declare class BaseProvider<Ann: Annotation> {
        kind: any;
        displayName: string;
        tags: Array<Tag>;
        annotation: Ann;

        getDependencies(): Array<Provider>;
        addDependency(dependency: Provider): void;

        getDependants(): Array<Provider>;
        addDependant(dependant: Provider): void;

        init(container: Container): void;

        createResolver(): Resolver;
    }
}
