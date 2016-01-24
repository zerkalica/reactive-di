/* @flow */

import type {
    DepId,
    ModelAnnotation,
    AsyncModelAnnotation,
    MetaAnnotation
} from '../annotations/annotationInterfaces'

import type {
    ModelDep,
    AsyncModelDep,
    MetaDep,
    AnyDep,

    Relations
} from '../nodes/nodeInterfaces'

import type {
    AnnotationResolver
} from './resolverInterfaces'

import type {FromJS, Cursor} from '../modelInterfaces'

import {
    ModelDepImpl,
    AsyncModelDepImpl
} from '../nodes/nodeImpl'

function begin(dep: AnyDep, acc: AnnotationResolver): void {
    acc.parents.push(new Set())
    acc.cache[dep.base.id] = dep
}

function end(dep: AnyDep, acc: AnnotationResolver): void {
    const depSet: Set<DepId> = acc.parents.pop();
    const {cache} = acc
    const {relations} = dep.base

    function iteratePathSet(relationId: DepId): void {
        const modelRels: Relations = cache[relationId].base.relations;
        modelRels.dataRels.push(dep)
        relations.dataRels = relations.dataRels.concat(modelRels.dataRels)
    }
    depSet.forEach(iteratePathSet)
}

function addRelations(id: DepId, parents: Array<Set<DepId>>): void {
    for (let i = 0, l = parents.length; i < l; i++) {
        parents[i].add(id)
    }
}

export function resolveModel<V: Object>(
    annotation: ModelAnnotation<V>,
    acc: AnnotationResolver
): void {
    const {base, info} = annotation
    const {childs} = info
    const cursor: Cursor<V> = acc.createCursor(info.statePath);
    const dep: ModelDep<V> = new ModelDepImpl(
        base.id,
        base.info,
        cursor.get(),
        cursor,
        info.fromJS
    );
    addRelations(base.id, acc.parents)
    begin(dep, acc)
    for (let i = 0, l = childs.length; i < l; i++) {
        acc.resolve(childs[i])
    }
    end(dep, acc)
}

export function resolveAsyncModel<V: Object, E>(
    annotation: AsyncModelAnnotation<V, E>,
    acc: AnnotationResolver
): void {
    const {base, info} = annotation
    const {childs} = info
    const cursor: Cursor<V> = acc.createCursor(info.statePath);
    const dep: AsyncModelDep<V, E> = new AsyncModelDepImpl(
        base.id,
        base.info,
        cursor.get(),
        cursor,
        info.fromJS
    );
    addRelations(base.id, acc.parents)
    begin(dep, acc)
    for (let i = 0, l = childs.length; i < l; i++) {
        acc.resolve(childs[i])
    }
    end(dep, acc)
}
