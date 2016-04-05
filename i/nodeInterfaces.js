/* @flow */

import type {
    DepItem,
    SimpleMap,
    Annotation,
    Dependency,
    Tag
} from 'reactive-di/i/annotationInterfaces'

export type EntityMeta<E> = {
    pending: boolean;
    rejected: boolean;
    fulfilled: boolean;
    reason: ?E;
}

export type ResolverCreator = {
    kind: any;
    displayName: string;
    tags: Array<Tag>;
    target: Dependency;
    childs: Set<ResolverCreator>;

    createResolver(): Resolver;
}

export type Resolver = {
    displayName: string;
    resolve(): any;
    reset(): void;
}

export type ResolveDepsResult<A> = {
    deps: Array<any|SimpleMap<string, any>>,
    middlewares: ?Array<A>
}

export type CreateResolverOptions = {
    deps: Array<DepItem>;
    target: Dependency;
}

export type Context = {
    parents: Array<ResolverCreator>;
    addRelation(dep: ResolverCreator): void;
    getResolverCreator(annotatedDep: Dependency): ResolverCreator;
    getResolver(annotatedDep: Dependency): Resolver;
    create(config: Array<Annotation>): Context;
    createDepResolver(rec: CreateResolverOptions, tags: Array<Tag>): () => ResolveDepsResult;
}

export type Plugin<Ann: Annotation, Dep: ResolverCreator> = {
    kind: any;
    create(annotation: Ann, acc: Context): Dep;
    finalize(dep: Dep, annotation: Ann, acc: Context): void;
}
