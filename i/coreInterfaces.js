/* @flow */

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

export type Collection<T: Disposable> = {
    items: Array<T>;
    add(item: T): void;
}

export type Annotation = {
    kind: any;
    displayName?: string;
    tags?: Array<Tag>;
    target: DependencyKey;
}

export type DepAnnotation = Annotation & {
    deps: Array<DepItem>;
}

export type Meta = {
    pending: boolean;
    success: boolean;
    error: boolean;
    reason: string;
}

export type PromiseSource = {
    promise: ?Promise<void>;
    meta: Meta;
}

export type PipeProvider<V, InitState> = {
    type: 'pipe';

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
    dependencies: Array<Provider>;

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
     * Resolve dependencies here via Container.createArgumentHelper()
     *
     * @example
     *
     * ```js
     * init(container: Container): void {
     *     this._helper = container.createArgumentHelper(this._annotation);
     * }
     * ```
     */
    init(container: Container, initState: ?InitState): void;

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
    addDependency(dependency: Provider): void;

    /**
     * Add dependant hook: noop by default
     */
    addDependant(dependant: Provider): void;
}

export type ValueProvider<V, InitState> = {
    type: 'value';
    set(v: V): boolean;

    displayName: string;
    tags: Array<Tag>;
    dependencies: Array<Provider>;
    isCached: boolean;
    isDisposed: boolean;
    value: V;
    init(container: Container, initState: InitState): void;
    dispose(): void;
    update(): void;
    addDependency(dependency: Provider): void;
    addDependant(dependant: Provider): void;
}

export type ListenerProvider<V, InitState> = {
    type: 'listener';
    notify(): void;

    displayName: string;
    tags: Array<Tag>;
    dependencies: Array<Provider>;
    isCached: boolean;
    isDisposed: boolean;
    value: V;
    init(container: Container, initState: InitState): void;
    dispose(): void;
    update(): void;
    addDependency(dependency: Provider): void;
    addDependant(dependant: Provider): void;
}

export type EmiterProvider<V, InitState> = {
    type: 'emiter';
    state: PromiseSource;
    reset(isNotify?: boolean): void;

    displayName: string;
    tags: Array<Tag>;
    dependencies: Array<Provider>;
    isCached: boolean;
    isDisposed: boolean;
    value: V;
    init(container: Container, initState: InitState): void;
    dispose(): void;
    update(): void;
    addDependency(dependency: Provider): void;
    addDependant(dependant: Provider): void;
}

export type Provider = PipeProvider | ValueProvider | ListenerProvider | EmiterProvider;

export type ArgumentHelper = {
    invokeComposed(...args: Array<any>): any;
    invokeFunction(): any;
    createObject<O: Object>(): O;
}

export type Container = {
    createArgumentHelper(annotation: DepAnnotation): ArgumentHelper;
    get(annotatedDep: DependencyKey): any;
    getProvider(annotatedDep: DependencyKey): Provider;
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

export type CreateContainerManager = (config?: Array<Annotation>) => ContainerManager;

export type RelationUpdater = {
    length: number;
    begin(dependant: Provider): void;
    end(dependant: Provider): void;
    addCached(dependency: Provider): void;
}
