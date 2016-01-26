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


import {getDeps, resolve, resolveHelper} from './resolverHelpers'

type AnyModelAnnotation<V, E> = ModelAnnotation<V>|AsyncModelAnnotation<V, E>;
type AnyModelDep<V, E> = ModelDep<V>|AsyncModelDep<V, E>;

function begin(id: DepId, dep: AnyDep, acc: CacheBuilderInfo): void {
    acc.parents.push(new Set())
    acc.cache[id] = dep
}

function endRegular(base: DepBase, acc: CacheBuilderInfo): void {
    const {parents, cache} = acc
    const depSet: Set<DepId> = parents.pop();
    const {relations} = base

    function iteratePathSet(relationId: DepId): void {
        const target: AnyDep = cache[relationId];
        relations.push(relationId)
        if (target.kind === 'model' || target.kind === 'asyncmodel') {
            target.dataOwners.push((base: Cacheable))
        } else if (target.kind === 'meta') {
            const {sources} = target
            for(let i = 0, l = sources.length; i < l; i++) {
                const {metaOwners} = sources[i]
                metaOwners.push((base: Cacheable))
                metaOwners.push((target.base: Cacheable))
            }
        }
    }
    depSet.forEach(iteratePathSet)
}

function addRelation(id: DepId, parents: Array<Set<DepId>>): void {
    for (let i = 0, l = parents.length; i < l; i++) {
        parents[i].add(id)
    }
}

function resolveAnyModel<V: Object, E>(
    annotation: AnyModelAnnotation<V, E>,
    acc: AnnotationResolver,
    Model: Class<ModelDepImpl<V>>|Class<AsyncModelDepImpl<V, E>>
): ModelDep<V>|AsyncModelDep<V, E> {
    const {base, info} = annotation
    const cursor: Cursor<V> = acc.createCursor(info.statePath);
    const dep: AnyModelDep<V, E> = new Model(
        base.id,
        base.info,
        cursor.get(),
        cursor,
        info.fromJS,
        acc.notifier
    );
    const {builderInfo} = acc
    addRelation(base.id, builderInfo.parents)
    begin(base.id, dep, builderInfo)
    const {childs} = info
    for (let i = 0, l = childs.length; i < l; i++) {
        resolve(childs[i], acc)
    }
    endRegular(dep.base, builderInfo)
    return dep
}

export function resolveModel<V: Object>(annotation: ModelAnnotation<V>, acc: AnnotationResolver): void {
    resolveAnyModel(annotation, acc, ModelDepImpl)
}

export function resolveAsyncModel<V: Object, E>(annotation: AsyncModelAnnotation<V, E>, acc: AnnotationResolver): void {
    const dep: AsyncModelDep<V, E> = ((resolveAnyModel(
        annotation,
        acc,
        AsyncModelDepImpl
    ): any): AsyncModelDep<V, E>);
    if (annotation.loader) {
        dep.loader = ((resolveHelper(annotation.loader, acc): any): FactoryDep<AsyncResult<V, E>>)
    }
}

function endMeta(sources: Array<AsyncModelDep>, acc: CacheBuilderInfo): void {
    const depSet: Set<DepId> = acc.parents.pop();
    function iteratePathSet(relationId: DepId): void {
        const target: AnyDep = acc.cache[relationId];
        if (target.kind === 'asyncmodel') {
            sources.push(target)
        }
    }
    depSet.forEach(iteratePathSet)
}

export function resolveMeta<E>(annotation: MetaAnnotation<E>, acc: AnnotationResolver): void {
    const {base} = annotation
    const dep: MetaDep<E> = new MetaDepImpl(base.id, base.info);

    const {builderInfo} = acc
    addRelation(base.id, builderInfo.parents)
    begin(base.id, dep, builderInfo)
    resolveHelper(base.target, acc);
    endMeta(dep.sources, acc.builderInfo)
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

export function resolveSetter<V: Object, E>(annotation: SetterAnnotation<V>, acc: AnnotationResolver): void {
    const {base} = annotation
    const dep: SetterDep<V, E> = new SetterDepImpl(base.id, base.info, base.target);
    begin(base.id, dep, acc.builderInfo)
    dep.invoker.depArgs = getDeps(annotation.deps, base.id, base.info.tags, acc)
    endRegular(dep.base, acc.builderInfo)

    const modelDep: AsyncModelDep<V, E> = (resolveHelper(annotation.model, acc): any);
    dep.set = modelDep.set
}

export function resolveLoader<V: Object, E>(annotation: LoaderAnnotation<V, E>, acc: AnnotationResolver): void {
    resolveFactory(((annotation: any): FactoryAnnotation<AsyncResult<V, E>>), acc)
}
