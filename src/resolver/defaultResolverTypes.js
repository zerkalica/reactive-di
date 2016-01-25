/* @flow */

import type {
    DepId,
    Deps,
    Dependency,
    ClassAnnotation,
    FactoryAnnotation,
    ModelAnnotation,
    AsyncModelAnnotation,
    MetaAnnotation
} from '../annotations/annotationInterfaces'

import type {
    Cacheable,
    DepArgs,
    DepBase,
    ModelDep,
    AsyncModelDep,
    MetaDep,
    ClassDep,
    FactoryDep,
    AnyDep
} from '../nodes/nodeInterfaces'

import type {
    CacheBuilderInfo,
    AnnotationResolver
} from './resolverInterfaces'

import type {SimpleMap, FromJS, Cursor} from '../modelInterfaces'

import {
    DepArgsImpl,

    MetaDepImpl,
    ClassDepImpl,
    FactoryDepImpl,
    ModelDepImpl,
    AsyncModelDepImpl
} from '../nodes/nodeImpl'

type AnyModelAnnotation<V, E> = ModelAnnotation<V>|AsyncModelAnnotation<V, E>;
type AnyModelDep<V, E> = ModelDep<V>|AsyncModelDep<V, E>;

function begin(id: DepId, dep: AnyDep, acc: CacheBuilderInfo): void {
    acc.parents.push(new Set())
    acc.cache[id] = dep
}

function endRegular(base: DepBase, acc: CacheBuilderInfo): void {
    const depSet: Set<DepId> = acc.parents.pop();
    const {relations} = base

    function iteratePathSet(relationId: DepId): void {
        const target: AnyModelDep = (acc.cache[relationId]: any);
        relations.push(relationId)
        target.dataOwners.push((base: Cacheable))
    }
    depSet.forEach(iteratePathSet)
}

function resolveAnyModel<V: Object, E>(
    annotation: AnyModelAnnotation<V, E>,
    acc: AnnotationResolver,
    Model: Class<any>
): void {
    const {base, info} = annotation
    const cursor: Cursor<V> = acc.createCursor(info.statePath);
    const dep: AnyModelDep<V, E> = new Model(
        base.id,
        info,
        cursor.get(),
        cursor,
        info.fromJS,
        acc.notifier
    );
    const {builderInfo} = acc
    const {parents} = builderInfo
    for (let i = 0, l = parents.length; i < l; i++) {
        parents[i].add(base.id)
    }
    begin(base.id, dep, builderInfo)
    const {childs} = info
    for (let i = 0, l = childs.length; i < l; i++) {
        acc.resolve(childs[i])
    }
    endRegular(dep.base, builderInfo)
}

export function resolveModel<V: Object>(annotation: ModelAnnotation<V>, acc: AnnotationResolver): void {
    resolveAnyModel(annotation, acc, ModelDepImpl)
}

export function resolveAsyncModel<V: Object, E>(annotation: AsyncModelAnnotation<V, E>, acc: AnnotationResolver): void {
    resolveAnyModel(annotation, acc, AsyncModelDepImpl)
}

function endMeta(base: DepBase, acc: CacheBuilderInfo): void {
    const depSet: Set<DepId> = acc.parents.pop();
    const {relations} = base

    function iteratePathSet(relationId: DepId): void {
        const target: AnyDep = acc.cache[relationId];
        relations.push(relationId)
        if (target.kind === 'asyncmodel') {
            target.metaOwners.push((base: Cacheable))
        }
    }
    depSet.forEach(iteratePathSet)
}

export function resolveMeta<E>(annotation: MetaAnnotation<E>, acc: AnnotationResolver): void {
    const {base} = annotation
    const dep: MetaDep<E> = new MetaDepImpl(base.id, base.info);
    begin(base.id, dep, acc.builderInfo)
    acc.resolve(base.target)
    endMeta(dep.base, acc.builderInfo)
}

function resolveMiddlewares(
    id: DepId,
    tags: Array<string>,
    middlewares: SimpleMap<DepId|string, Array<Dependency>>,
    acc: AnnotationResolver
): ?Array<AnyDep> {
    const ids: Array<string> = [id].concat(tags);
    const middlewareDeps: Array<AnyDep> = [];
    for (let i = 0, l = ids.length; i < l; i++) {
        const depMiddlewares: Array<Dependency> = middlewares[ids[i]] || [];
        for (let j = 0, k = depMiddlewares.length; j < k; j++) {
            middlewareDeps.push(acc.resolve(depMiddlewares[j]))
        }

    }

    return middlewareDeps.length ? middlewareDeps : null
}

function getDeps(
    deps: ?Deps,
    id: DepId,
    tags: Array<string>,
    acc: AnnotationResolver
): DepArgs {
    let depNames: ?Array<string> = null;
    const resolvedDeps: Array<AnyDep> = [];
    if (deps && deps.length) {
        if (typeof deps[0] === 'object') {
            depNames = []
            const argsObject: SimpleMap<string, Dependency> =  ((deps[0]: any): SimpleMap<string, Dependency>);
            for (let key in argsObject) {
                resolvedDeps.push(acc.resolve(argsObject[key]))
                depNames.push(key)
            }
        } else {
            for (let i = 0, l = deps.length; i < l; i++) {
                resolvedDeps.push(acc.resolve((deps: Array<Dependency>)[i]))
            }
        }
    }

    const middlewares: ?Array<AnyDep> = resolveMiddlewares(id, tags, acc.middlewares, acc);
    return new DepArgsImpl(resolvedDeps, depNames, middlewares)
}

export function resolveClass<V: Object>(annotation: ClassAnnotation<V>, acc: AnnotationResolver): void {
    const {base} = annotation
    const dep: ClassDep<V> = new ClassDepImpl(base.id, base.info, base.target);
    begin(base.id, dep, acc.builderInfo)
    dep.invoker.depArgs = getDeps(annotation.deps, base.id, base.info.tags, acc)
    endRegular(dep.base, acc.builderInfo)
}

export function resolveFactory<V: Object>(annotation: FactoryAnnotation<V>, acc: AnnotationResolver): void {
    const {base} = annotation
    const dep: FactoryDep<V> = new FactoryDepImpl(base.id, base.info, base.target);
    begin(base.id, dep, acc.builderInfo)
    dep.invoker.depArgs = getDeps(annotation.deps, base.id, base.info.tags, acc)
    endRegular(dep.base, acc.builderInfo)
}
