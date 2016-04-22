/* @flow */

import type {
    Disposable,
    Tag,
    DependencyKey,
    Dependency,
    Annotation,
    Provider,
    CreatePlugin,
    RelationUpdater,
    CreateContainerManager,
    ContainerManager
} from 'reactive-di/i/coreInterfaces'

declare module 'reactive-di' {
    declare class AnnotationDriver {
        annotate<Ann: Annotation>(annotatedDep: Dependency, annotation: Ann): void;
        getAnnotation(annotatedDep: Dependency): Annotation;
    }

    declare function fastCall<T>(fn: Function, args: Array<any>): T;
    declare function fastCreateObject<T>(target: Class<T>, args: Array<any>): T;

    declare var annotationDriver: AnnotationDriver;

    declare function createManagerFactory(
        pluginsConfig?: Array<CreatePlugin>,
        createUpdater?: () => RelationUpdater
    ): CreateContainerManager;

    declare function createHotRelationUpdater(): RelationUpdater;
    declare function createDummyRelationUpdater(): RelationUpdater;

    declare var defaultPlugins: Array<Plugin>;

    declare class DisposableCollection<T: Disposable> {
        items: Array<T>;
        add(item: T): void;
    }

    declare class SimpleMap<K, V> extends Map<K, V> {}
    declare class SimpleSet<V> extends Set<V> {}

    declare class BaseProvider {
        displayName: string;
        tags: Array<Tag>;
        isDisposed: boolean;
        isCached: boolean;
        dependencies: Array<Provider>;

        dispose(): void;
        update(): void;
        addDependency(dependency: Provider): void;
        addDependant(dependant: Provider): void;
    }
}
