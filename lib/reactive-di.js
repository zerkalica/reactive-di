/* @flow */

import type {
    Disposable,
    Collection,
    Container,
    Tag,
    DependencyKey,
    Dependency,
    Annotation,
    Provider,
    Plugin,
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

    declare class Plugin {
        kind: any;
        create(annotation: Annotation, container: Container): Provider;
    }

    declare function createManagerFactory(
        pluginsConfig?: Array<Plugin>,
        createUpdater?: () => RelationUpdater
    ): (config?: Array<Annotation>) => ContainerManager;

    declare function createHotRelationUpdater(): RelationUpdater;
    declare function createDummyRelationUpdater(): RelationUpdater;

    declare var defaultPlugins: Array<Plugin>;

    declare class DisposableCollection<T: Disposable> {
        items: Array<T>;
        add(item: T): void;
    }

    declare class SimpleMap<K, V> extends Map<K, V> {}
    declare class SimpleSet<V> extends Set<V> {}

    declare class BaseProvider<InitState> {
        displayName: string;
        tags: Array<Tag>;
        isDisposed: boolean;
        isCached: boolean;
        dependencies: Array<Provider>;

        init(container: Container, initState: ?InitState): void;
        dispose(): void;
        update(): void;
        addDependency(dependency: Provider): void;
        addDependant(dependant: Provider): void;
    }
}
