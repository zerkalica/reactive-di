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

export type ResolvableDep<V> = {
    kind: any;
    isRecalculate: boolean;
    displayName: string;
    tags: Array<Tag>;
    resolve(): V;
}

export type GetResolvableDep<V: ResolvableDep> = (annotatedDep: Dependency<V>) => V;

export type ResolveDepsResult<A> = {
    deps: Array<any|SimpleMap<string, any>>,
    middlewares: ?Array<A>
}

export type CreateResolverOptions = {
    deps: Array<DepItem>;
    target: Dependency;
}

export type Context = {
    parents: Array<ResolvableDep>;
    resolve(annotatedDep: Dependency): ResolvableDep;
    create(config: Array<Annotation>): Context;
    createDepResolver(rec: CreateResolverOptions, tags: Array<Tag>): () => ResolveDepsResult;
}

export type Plugin<Ann: Annotation, Dep: ResolvableDep> = {
    kind: any;
    create(annotation: Ann, acc: Context): Dep;
    finalize(dep: Dep, annotation: Ann, acc: Context): void;
}
