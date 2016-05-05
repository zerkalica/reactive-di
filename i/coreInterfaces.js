/* @flow */

export type Target = Function|Object;
export type Metadata = any;
export type MetadataDriver = {
    get(target: Target): any;
    set(target: Target, metadata: Metadata): void;
    has(target: Target): boolean;
}

export type Tag = string;
export type DepFn<T> = (...x: any) => T;
export type Dependency<T> = DepFn<T>|Class<T>;
export type DependencyKey<T> = Dependency<T>;
export type ArgsObject = {
    [name: string]: DependencyKey;
}
export type DepItem = DependencyKey|ArgsObject;

export type Disposable = {
    isDisposed: boolean;
}

export type RawAnnotation = {
    kind: any;
    target?: DependencyKey;
    tags?: Array<Tag>;
    deps?: Array<DepItem>;
}

export type Annotation = {
    kind: any;
    displayName?: string;
    tags?: Array<Tag>;
    target: DependencyKey;
    deps?: Array<DepItem>;
}

export type Provider<V, P: Provider> = {
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

export type PassiveProvider<V> = {
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

export type ArgumentHelper = {
    invokeComposed(...args: Array<any>): any;
    invokeFunction(): any;
    createObject<O: Object>(): O;
}

export type Container<P: Provider> = {
    parent: ?Container;
    createArgumentHelper(annotation: Annotation): ArgumentHelper;
    beginInitialize(annotatedDep: DependencyKey, provider: P): void;
    get(annotatedDep: DependencyKey): any;
    hasProvider(annotatedDep: DependencyKey): boolean;
    getProvider(annotatedDep: DependencyKey): P;
    delete(annotatedDep: DependencyKey): void;
    dispose(): void;
}

export type ContainerManager = {
    setMiddlewares(
        raw?: Array<[DependencyKey, Array<Tag|DependencyKey>]>
    ): ContainerManager;
    createContainer(parent?: Container, state?: Array<[DependencyKey, any]>): Container;
    replace(oldDep: DependencyKey, newDep?: DependencyKey|Annotation): void;
}

export type CreateContainerManager = (config?: Array<RawAnnotation|DependencyKey>) => ContainerManager;

export type RelationUpdater<P: Provider> = {
    length: number;
    begin(dependant: P): void;
    end(dependant: P): void;
    addCached(dependency: P): void;
}

export type Plugin<State, A: Annotation, P: Provider> = {
    kind: any;
    createProvider(
        annotation: A,
        container: Container,
        initialState: ?State
    ): P;
}

export type CreatePlugin = (cm: CreateContainerManager) => Plugin;
