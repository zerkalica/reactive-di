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

export type Provider<V, Ann: Annotation, P> = {
    kind: any;
    displayName: string;
    tags: Array<Tag>;
    annotation: Ann;

    /**
     * Read only dependencies
     */
    dependencies: Array<P>;

    /**
     * Provider.get read this property if false - recalculates get result.
     * Dependency provider can set isCached to false
     *
     * read/write
     */
    isCached: boolean;

    /**
     * Used for garbage collector, when disposing container
     */
    isDisposed: boolean;


    init(container: Container): void;
    dispose(): void;

    value: V;

    update(): void;

    addDependency(dependency: P): void;
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
