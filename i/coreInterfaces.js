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

export type Provider<V, A: Annotation, P: Provider> = {
    /**
     * Provider type
     */
    kind: any;

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
     * Resolve dependencies here via Container.createArgumentHelper()
     *
     * @example
     *
     * ```js
     * init(annotation: FactoryAnnotation, container: Container): void {
     *     this._helper = container.createArgumentHelper(annotation);
     * }
     * ```
     */
    init(annotation: A, container: Container): void;

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

export type Plugin<Ann: Annotation, P: Provider> = {
    kind: any;
    create(annotation: Ann, container: Container): P;
}

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
    createContainer(parent?: Container): Container;
    replace(oldDep: DependencyKey, newDep?: DependencyKey|Annotation): void;
}

export type CreateContainerManager = (config?: Array<Annotation>) => ContainerManager;

export type RelationUpdater = {
    length: number;
    begin(dependant: Provider): void;
    end(dependant: Provider): void;
    addCached(dependency: Provider): void;
}
