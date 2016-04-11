/* @flow */

import type {
    Tag,
    Dependency,
    Annotation,
    Provider,
    Plugin,
    RelationUpdater,
    Context,
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

    declare function createHotRelationUpdater(): RelationUpdater;
    declare function createDummyRelationUpdater(): RelationUpdater;
    declare var defaultPlugins: Array<Plugin>;

    declare class SimpleMap<K, V> extends Map<K, V> {}
    declare class BaseProvider<Ann: Annotation> {
        kind: any;
        displayName: string;
        tags: Array<Tag>;
        annotation: Ann;

        getChilds(): Array<Provider>;
        addChild(child: Provider): void;

        getParents(): Array<Provider>;
        addParent(parent: Provider): void;

        init(context: Context): void;

        createResolver(): Resolver;
    }
}
