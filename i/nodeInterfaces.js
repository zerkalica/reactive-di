/* @flow */

import type {
    DepItem,
    Annotation,
    ArgsObject,
    Dependency,
    Tag
} from 'reactive-di/i/annotationInterfaces'

export type EntityMeta<E> = {
    pending: boolean;
    rejected: boolean;
    fulfilled: boolean;
    reason: ?E;
}

export type Provider<Ann: Annotation> = {
    kind: any;
    displayName: string;
    tags: Array<Tag>;
    annotation: Ann;

    getChilds(): Array<Provider>;
    addChild(child: Provider): void;
    canAddToParent(parent: Provider): boolean;

    init(context: Context): void;
    createResolver(): Resolver;
}

export type Plugin<Ann: Annotation, P: Provider> = {
    kind: any;
    create(annotation: Ann, acc: Context): P;
}

export type Resolver = {
    displayName: string;
    resolve(): any;
    reset(): void;
}

export type ResolveDepsResult<A> = {
    deps: Array<any|ArgsObject<string, any>>,
    middlewares: ?Array<A>
}

export type CreateResolverOptions = {
    deps: Array<DepItem>;
    target: Dependency;
}

export type Context = {
    replace(annotatedDep: Dependency, annotation?: Annotation): void;
    getProvider(annotatedDep: Dependency): Provider;
    getResolver(annotatedDep: Dependency): Resolver;
    create(config: Array<Annotation>): Context;
    createDepResolver(rec: CreateResolverOptions, tags: Array<Tag>): () => ResolveDepsResult;
}
