/* @flow */

import type {
    DepId,
    Dependency,
    ModelAnnotation,
    AsyncModelAnnotation,
    MetaAnnotation
} from '../annotations/annotationInterfaces'

import type {
    Cacheable,
    DepBase,
    ModelDep,
    AsyncModelDep,
    MetaDep,
    AnyDep
} from '../nodes/nodeInterfaces'

import type {
    CacheBuilderInfo,
    AnnotationResolver
} from './resolverInterfaces'

import type {SimpleMap, FromJS, Cursor} from '../modelInterfaces'

import {
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

function addRelations(id: DepId, parents: Array<Set<DepId>>): void {
    for (let i = 0, l = parents.length; i < l; i++) {
        parents[i].add(id)
    }
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
    addRelations(base.id, builderInfo.parents)
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
