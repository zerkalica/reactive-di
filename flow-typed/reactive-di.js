/* @flow */

declare module 'reactive-di' {
    declare type Target = Function|Object;
    declare interface MetadataDriver<Metadata> {
        get(target: Target): Metadata;
        set(target: Target, metadata: Metadata): void;
        has(target: Target): boolean;
    }

    declare type DepFn<T> = (...x: any) => T;
    declare type Dependency<T> = DepFn<T>|Class<T>;
    declare type DependencyKey<T> = Dependency<T>|string;
    declare type ArgsObject = {
        [name: string]: DependencyKey;
    };
    declare type Tag = string;
    declare type DepItem = DependencyKey|ArgsObject;

    declare interface Disposable {
        isDisposed: boolean;
    }

    declare interface RawAnnotation {
        kind: any;
        tags?: Array<Tag>;
        deps?: Array<DepItem>;
    }

    declare type ConfigItem =
        | [DependencyKey, RawAnnotation]
        | Dependency;

    declare interface Annotation {
        kind: any;
        displayName: string;
        tags: Array<Tag>;
        target: Dependency;
        deps: Array<DepItem>;
    }

    declare interface Provider<V, P: Provider> {
        /**
         * Debug name
         */
        displayName: string;

        /**
         * Tags from annotation. Used in middlewares: cat attach middleware by tag.
         */
        tags: Array<Tag>;

        /**
         * Cached dependencies. Used in Container.
         * Not for use in Provider.
         */
        dependencies: Array<P>;

        /**
         * If true - Container runs Provider.update()
         * Provider.update() sets to true
         */
        isCached: boolean;

        /**
         * Used in dependantas collections, sets to true when disposing container with dependantas.
         * Ignore this dependants in for loops
         */
        isDisposed: boolean;

        /**
         * Evaluated dependency value
         */
        value: V;

        /**
         * Set isDisposed = true and runs some logic for unsubscribes
         */
        dispose(): void;

        /**
         * Evaluate value and set isCached = true
         */
        update(): void;

        /**
         * Add dependecy hook: noop by default
         */
        addDependency(dependency: P): void;

        /**
         * Add dependant hook: noop by default
         */
        addDependant(dependant: P): void;
    }

    declare interface PassiveProvider<V> {
        type: 'passive';

        displayName: string;
        tags: Array<Tag>;
        dependencies: Array<Provider>;
        isCached: boolean;
        isDisposed: boolean;
        value: V;
        dispose(): void;
        update(): void;
        addDependency(dependency: Provider): void;
        addDependant(dependant: Provider): void;
    }

    declare interface ArgumentHelper {
        invokeComposed(...args: Array<any>): any;
        invokeFunction(): any;
        createObject<O: Object>(): O;
    }

    declare interface AnnotationMap<A: Annotation> {
        get(key: DependencyKey): ?A;
        getFromDriver(key: DependencyKey): ?A;
        set(config: Array<ConfigItem>): void;
    }

    declare interface Container<P: Provider> {
        _parent: ?Container;
        _annotations: AnnotationMap;
        initState: Map<string, mixed>;
        createArgumentHelper(annotation: Annotation): ArgumentHelper;
        beginInitialize(annotatedDep: DependencyKey, provider: P): void;
        get(annotatedDep: DependencyKey): any;
        getParentProvider(key: DependencyKey): ?Provider;
        getProvider(annotatedDep: DependencyKey): P;
        delete(annotatedDep: DependencyKey): void;
        dispose(): void;
    }

    declare interface ContainerManager {
        setMiddlewares(
            raw?: Array<[DependencyKey, Array<Tag|DependencyKey>]>
        ): ContainerManager;
        createContainer(parent?: Container, state?: Array<[string, mixed]>): Container;
    }

    declare type CreateContainerManager = (
        config?: Array<ConfigItem>
    ) => ContainerManager;

    declare type RelationUpdater<P: Provider> = {
        length: number;
        begin(dependant: P): void;
        end(dependant: P): void;
        addCached(dependency: P): void;
    }

    declare interface Plugin<State, A: Annotation, P: Provider> {
        kind: any;
        createContainerManager: CreateContainerManager;

        createProvider(
            annotation: A,
            container: Container,
            initialState: ?State
        ): P;
    }

    declare interface AliasAnnotation extends Annotation {
        kind: 'alias';
        alias: DependencyKey;
    }

    declare interface ComposeAnnotation extends Annotation {
        kind: 'compose';
    }

    declare interface FactoryAnnotation extends Annotation {
        kind: 'factory';
    }

    declare interface ClassAnnotation extends Annotation {
        kind: 'klass';
    }

    declare interface ValueAnnotation<V> extends Annotation {
        kind: 'value';
        value: V;
    }

    declare function fastCall<T>(fn: Function, args: Array<any>): T;
    declare function fastCreateObject<T>(target: Class<T>, args: Array<any>): T;

    declare function createHotRelationUpdater(): RelationUpdater;
    declare function createDummyRelationUpdater(): RelationUpdater;

    declare class SimpleMap<K, V> extends Map<K, V> {}
    declare class SimpleSet<V> extends Set<V> {}

    declare function createManagerFactory(
        pluginsConfig?: Array<Plugin>,
        createUpdater?: () => RelationUpdater
    ): CreateContainerManager;

    declare var defaultPlugins: Plugin[]

    declare class BaseProvider<P: Provider> {
        displayName: string;
        tags: Array<Tag>;
        isDisposed: boolean;
        isCached: boolean;
        dependencies: Array<P>;

        constructor(
            annotation: Annotation,
            container: Container
        ): void;

        dispose(): void;
        update(): void;
        addDependency(dependency: P): void;
        addDependant(dependant: P): void;
    }
}
