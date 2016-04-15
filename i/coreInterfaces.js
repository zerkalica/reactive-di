/* @flow */

export type Tag = string;
export type DepFn<T> = (...x: any) => T;
export type Dependency<T> = DepFn<T>|Class<T>;
export type DependencyKey<T> = Dependency<T>|string;
export type ArgsObject = {
    [name: string]: DependencyKey;
}
export type DepItem = DependencyKey|ArgsObject;

export type Annotation = {
    kind: any;
    tags?: Array<Tag>;
    target: DependencyKey;
}

export type Resolver = {
    provider: Provider;
    resolve(): any;
    reset(): void;
    dispose(): void;
}

export type Provider<Ann: Annotation> = {
    kind: any;
    displayName: string;
    tags: Array<Tag>;
    annotation: Ann;

    getDependencies(): Array<Provider>;
    addDependency(dependency: Provider): void;

    getDependants(): Array<Provider>;
    addDependant(dependant: Provider): void;

    createResolver(container: Container): Resolver;
}

export type Plugin<Ann: Annotation> = {
    kind: any;
    create(annotation: Ann): Provider;
}

export type ResolveDepsResult<A> = {
    deps: Array<any>,
    middlewares: ?Array<A>
}

export type CreateResolverOptions = {
    deps: Array<DepItem>;
    target: DependencyKey;
}

export type Container = {
    get(annotatedDep: DependencyKey): any;
    getResolver(annotatedDep: DependencyKey): Resolver;
    delete(annotatedDep: DependencyKey): void;
    dispose(): void;
    createDepResolver(rec: CreateResolverOptions, tags: Array<Tag>): () => ResolveDepsResult;
}

export type CreateContainer = (
    helper: ContainerHelper,
    parent: ?Container
) => Container;

export type ContainerManager = {
    setMiddlewares(
        raw?: Array<[DependencyKey, Array<Tag|DependencyKey>]>
    ): ContainerManager;
    createContainer(parent?: Container): Container;
    replace(oldDep: DependencyKey, newDep?: DependencyKey|Annotation): void;
}

export type CreateContainerManager = (config?: Array<Annotation>) => ContainerManager;

export type RelationUpdater = {
    dependants: Array<Set<Provider>>;
    begin(provider: Provider): void;
    end(provider: Provider): void;
    inheritRelations(provider: Provider): void;
}

export type ContainerHelper = {
    updater: RelationUpdater;
    middlewares: Map<DependencyKey|Tag, Array<DependencyKey>>;
    removeContainer(container: Container): void;
    createProvider(annotatedDep: DependencyKey, isParent: boolean): ?Provider;
}
