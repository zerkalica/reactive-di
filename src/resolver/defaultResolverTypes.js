/* @flow */

import type {
    DepId,
    Deps,
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
    AsyncUpdater,
    MetaSource,
    Cacheable,
    DepArgs,
    DepBase,
    ModelDep,
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
    SetterDepImpl
} from '../nodes/nodeImpl'

import type {Observable, Subscription} from '../observableInterfaces'

import {getDeps, resolve, resolveHelper} from './resolverHelpers'

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
        switch(target.kind) {
            case 'model':
                target.dataOwners.push((base: Cacheable))
                if (target.updater) {
                    base.subscriptions.push((target.updater: Subscription))
                }
                break
            case 'meta':
                const {sources} = target
                for(let i = 0, l = sources.length; i < l; i++) {
                    const {metaOwners} = sources[i]
                    metaOwners.push((base: Cacheable))
                }
                break
            default:
                throw new TypeError('Unhandlered dep type: ' + target.kind)
        }
    }
    depSet.forEach(iteratePathSet)
}

function addRelation(id: DepId, parents: Array<Set<DepId>>): void {
    for (let i = 0, l = parents.length; i < l; i++) {
        parents[i].add(id)
    }
}

export function resolveModel<V: Object, E>(
    annotation: ModelAnnotation<V>|AsyncModelAnnotation<V, E>,
    acc: AnnotationResolver
): void {
    const {base, info} = annotation
    const cursor: Cursor<V> = acc.createCursor(info.statePath);

    const loader: ?FactoryDep<Observable<V, E>> = annotation.loader
        ? (resolveHelper(annotation.loader, acc): any)
        : null;

    const dep: ModelDep<V, E> = new ModelDepImpl(
        base.id,
        base.info,
        cursor,
        info.fromJS,
        acc.notifier,
        annotation.kind === 'asyncmodel',
        loader
    );
    const {builderInfo} = acc
    addRelation(base.id, builderInfo.parents)
    begin(base.id, dep, builderInfo)
    const {childs} = info
    for (let i = 0, l = childs.length; i < l; i++) {
        resolve(childs[i], acc)
    }
    endRegular(dep.base, builderInfo)
}

function endMeta(cacheable: Cacheable, sources: Array<AsyncUpdater>, acc: CacheBuilderInfo): void {
    const depSet: Set<DepId> = acc.parents.pop();
    function iteratePathSet(relationId: DepId): void {
        const target: AnyDep = acc.cache[relationId];
        if (target.kind === 'model' && target.updater) {
            target.updater.metaOwners.push(cacheable)
            sources.push(((target.updater: any): AsyncUpdater))
        }
    }
    depSet.forEach(iteratePathSet)
}

export function resolveMeta<E>(annotation: MetaAnnotation<E>, acc: AnnotationResolver): void {
    const {base} = annotation
    const dep: MetaDep<E> = new MetaDepImpl(base.id, base.info);

    const {builderInfo} = acc
    addRelation(base.id, builderInfo.parents)
    const parents: Array<Set<DepId>> = [];

    const newBuilderInfo: CacheBuilderInfo = {
        cache: builderInfo.cache,
        parents
    };

    begin(base.id, dep, newBuilderInfo)
    resolve(base.target, acc);
    endMeta(dep.base, dep.sources, newBuilderInfo)
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
    const {builderInfo} = acc
    const newAcc: AnnotationResolver = {
        ...acc,
        builderInfo: {
            cache: builderInfo.cache,
            parents: []
        }
    };

    const modelDep: AnyDep = resolve(annotation.model, newAcc);
    if (modelDep.kind !== 'model') {
        throw new Error('Not a model dep type: ' + modelDep.kind)
    }
    const {updater} = modelDep
    const dep: SetterDep<V, E> = new SetterDepImpl(
        base.id,
        base.info,
        base.target,
        updater ? updater.subscribe : modelDep.set
    );

    begin(base.id, dep, builderInfo)
    dep.invoker.depArgs = getDeps(annotation.deps, base.id, base.info.tags, acc)
    endRegular(dep.base, builderInfo)
}

export function resolveLoader<V: Object, E>(annotation: LoaderAnnotation<V, E>, acc: AnnotationResolver): void {
    resolveFactory(((annotation: any): FactoryAnnotation<Observable<V, E>>), acc)
}
