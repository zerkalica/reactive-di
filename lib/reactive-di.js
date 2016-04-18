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

    declare class BaseProvider<V, Ann: Annotation, P: Provider> {
        kind: any;
        displayName: string;
        tags: Array<Tag>;

        annotation: Ann;

        value: V;

        isDisposed: boolean;
        isCached: boolean;

        dependencies: Array<Provider|P>;
        dependants: Collection<Provider|P>;

        constructor(annotation: Ann): void;

        init(container: Container): void;
        dispose(): void;
        update(): void;
        addDependency(dependency: P): void;
        addDependant(dependant: P): void;
    }
}
