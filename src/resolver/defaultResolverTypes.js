/* @flow */

import type {
    DepId,
    Deps,
    AsyncResult,
    Dependency,
    AnyAnnotation,
    ClassAnnotation,
    LoaderAnnotation,
    FactoryAnnotation,
    ModelAnnotation,
    AsyncModelAnnotation,
    MetaAnnotation,
    SetterAnnotation
} from '../annotations/annotationInterfaces'

import type {

    MetaSource,
    Cacheable,
    DepArgs,
    DepBase,
    ModelDep,
    AsyncModelDep,
    MetaDep,
    ClassDep,
    FactoryDep,
    SetterDep,

    AnyDep
} from '../nodes/nodeInterfaces'

import type {
    CacheBuilderInfo,
    AnnotationResolver,
    ResolverType,
    ResolverTypeMap
} from './resolverInterfaces'

import type {Cursor} from '../modelInterfaces'

import {
    DepArgsImpl,

    MetaDepImpl,
    ClassDepImpl,
    FactoryDepImpl,
    ModelDepImpl,
    AsyncModelDepImpl,
    SetterDepImpl
} from '../nodes/nodeImpl'


import {getDeps, resolve} from './resolverHelpers'

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

export function resolveModel<V: Object>(annotation: ModelAnnotation<V>, acc: AnnotationResolver): void {
    const {base, info} = annotation
    const cursor: Cursor<V> = acc.createCursor(info.statePath);
    const dep: ModelDep<V> = new ModelDepImpl(
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
        resolve(childs[i], acc)
    }
    endRegular(dep.base, builderInfo)
}

export function resolveAsyncModel<V: Object, E>(annotation: AsyncModelAnnotation<V, E>, acc: AnnotationResolver): void {
    const {base, info, loader} = annotation
    const cursor: Cursor<V> = acc.createCursor(info.statePath);
    const dep: AsyncModelDep<V, E> = new AsyncModelDepImpl(
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
        resolve(childs[i], acc)
    }
    if (loader) {
        dep.loader = resolve(loader, acc)
    }
    endRegular(dep.base, builderInfo)
}

function endMeta(base: DepBase, sources: Array<MetaSource>, acc: CacheBuilderInfo): void {
    const depSet: Set<DepId> = acc.parents.pop();
    const {relations} = base

    function iteratePathSet(relationId: DepId): void {
        const target: AnyDep = acc.cache[relationId];
        relations.push(relationId)
        if (target.kind === 'asyncmodel') {
            target.metaOwners.push((base: Cacheable))
            sources.push(target)
        }

    }
    depSet.forEach(iteratePathSet)
}

export function resolveMeta<E>(annotation: MetaAnnotation<E>, acc: AnnotationResolver): void {
    const {base} = annotation
    const dep: MetaDep<E> = new MetaDepImpl(base.id, base.info);
    begin(base.id, dep, acc.builderInfo)
    resolve(base.target, acc);
    endMeta(dep.base, dep.sources, acc.builderInfo)
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

export function resolveSetter<V: Object, E>(annotation: SetterAnnotation<V, E>, acc: AnnotationResolver): void {
    const {base, model} = annotation
    const dep: SetterDep<V, E> = new SetterDepImpl(base.id, base.info, base.target);
    begin(base.id, dep, acc.builderInfo)
    dep.invoker.depArgs = getDeps(annotation.deps, base.id, base.info.tags, acc)

    const modelDep: AsyncModelDep<V, E> = resolve(model, {...acc, parents: []});

    dep.set = modelDep.set
    endRegular(dep.base, acc.builderInfo)
}

export function resolveLoader<V: Object, E>(annotation: LoaderAnnotation<V, E>, acc: AnnotationResolver): void {
    resolveFactory((annotation: FactoryAnnotation<AsyncResult<V, E>>), acc)
}
