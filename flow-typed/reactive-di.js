/* @flow */

type Rdi$DepFn<T> = (...x: any) => T;
type Rdi$Dependency<T> = Rdi$DepFn<T>|Class<T>;
type Rdi$DependencyKey<T> = Rdi$Dependency<T>|string;
type Rdi$ArgsObject = {
    [name: string]: Rdi$DependencyKey;
};
type Rdi$Tag = string;
type Rdi$DepItem = Rdi$DependencyKey|Rdi$ArgsObject;

interface Rdi$RawAnnotation {
    kind: any;
    target?: Rdi$Dependency;
    tags?: Array<Rdi$Tag>;
    deps?: Array<Rdi$DepItem>;
}

declare module 'reactive-di' {
    declare type Target = Function|Object;
    declare interface MetadataDriver<Metadata> {
        get(target: Target): Metadata;
        set(target: Target, metadata: Metadata): void;
        has(target: Target): boolean;
    }

    declare type Tag = Rdi$Tag;
    declare type DepFn<T> = Rdi$DepFn<T>;
    declare type Dependency<T> = Rdi$Dependency<T>;
    declare type DependencyKey<T> = Rdi$DependencyKey<T>;
    declare type ArgsObject = Rdi$ArgsObject;
    declare type DepItem = Rdi$DepItem;

    declare interface Disposable {
        isDisposed: boolean;
    }

    declare interface RawAnnotation {
        kind: any;
        target?: Dependency;
        tags?: Array<Tag>;
        deps?: Array<DepItem>;
    }

    declare type ConfigItem =
        RawAnnotation
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

    declare interface Container<P: Provider> {
        parent: ?Container;
        createArgumentHelper(annotation: Annotation): ArgumentHelper;
        beginInitialize(annotatedDep: DependencyKey, provider: P): void;
        get(annotatedDep: DependencyKey): any;
        hasProvider(annotatedDep: DependencyKey): boolean;
        getProvider(annotatedDep: DependencyKey): P;
        delete(annotatedDep: DependencyKey): void;
        dispose(): void;
    }

    declare interface ContainerManager {
        setMiddlewares(
            raw?: Array<[DependencyKey, Array<Tag|DependencyKey>]>
        ): ContainerManager;
        createContainer(parent?: Container, state?: Array<[DependencyKey, any]>): Container;
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
        createProvider(
            annotation: A,
            container: Container,
            initialState: ?State
        ): P;
    }

    declare type CreatePlugin = (cm: CreateContainerManager) => Plugin;

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
        pluginsConfig?: Array<CreatePlugin>,
        createUpdater?: () => RelationUpdater
    ): CreateContainerManager;

    declare var defaultPlugins: Array<Plugin>;

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

declare module 'reactive-di/inject' {
    declare var exports: <V: Function>(...deps: Array<Rdi$DepItem>) => (target: V) => V;
}

declare module 'reactive-di/configurations' {
    declare function alias(target: Rdi$Dependency, aliasTarget: Rdi$DependencyKey): Rdi$RawAnnotation;
    declare function klass(arget: Rdi$Dependency, ...deps: Array<Rdi$DepItem>): Rdi$RawAnnotation;
    declare function compose(target: Function, ...deps: Array<Rdi$DepItem>): Rdi$RawAnnotation;
    declare function factory(target: Function, ...deps: Array<Rdi$DepItem>): Rdi$RawAnnotation;
    declare function tag(annotation: Rdi$RawAnnotation, ...tags: Array<Rdi$Tag>): Rdi$RawAnnotation;
    declare function value(target: Rdi$Dependency, val?: any): Rdi$RawAnnotation;
}

declare module 'reactive-di/annotations' {
    declare function alias(aliasTarget: Rdi$Dependency): (target: Rdi$Dependency) => Rdi$Dependency;
    declare function klass<V: Function>(...deps: Array<Rdi$DepItem>): (target: V) => V;
    declare function compose<V: Function>(...deps: Array<Rdi$DepItem>): (target: V) => V;
    declare function factory<V: Function>(...deps: Array<Rdi$DepItem>): (target: V) => V;
    declare function tag(...tags: Array<Rdi$Tag>): (target: Rdi$Dependency) => Rdi$Dependency;
    declare function valueAnn(val?: any): (target: Rdi$Dependency) => Rdi$Dependency;
}
