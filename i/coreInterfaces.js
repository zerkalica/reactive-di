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
    resolve(): any;
    reset(): void;
}

export type Provider<Ann: Annotation> = {
    kind: any;
    displayName: string;
    tags: Array<Tag>;
    annotation: Ann;

    getChilds(): Array<Provider>;
    addChild(child: Provider): void;

    getParents(): Array<Provider>;
    addParent(parent: Provider): void;

    init(context: Container): void;

    createResolver(): Resolver;
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
    createDepResolver(rec: CreateResolverOptions, tags: Array<Tag>): () => ResolveDepsResult;
}

export type CreateContainerManager = (config?: Array<Annotation>) => ContainerManager;

export type ContainerManager = {
    setMiddlewares(
        raw?: Array<[DependencyKey, Array<Tag|DependencyKey>]>
    ): ContainerManager;
    createContainer(parent?: Container): Container;
    replace(annotatedDep: DependencyKey, annotation?: Annotation): void;
}

export type RelationUpdater = {
    begin(provider: Provider): void;
    end(provider: Provider): void;
    inheritRelations(provider: Provider): void;
}
