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

function resolveMeta<E>(annotation: MetaAnnotation<E>, acc: AnnotationResolver): void {
    const {base} = annotation
    const dep: MetaDep<E> = new MetaDepImpl(base.id, base.info);

    acc.addRelation(base.id)
    const newAcc: AnnotationResolver = acc.newRoot();
    newAcc.begin(dep)
    newAcc.resolve(base.target)
    newAcc.end(dep)
}

function resolveClass<V: Object>(annotation: ClassAnnotation<V>, acc: AnnotationResolver): void {
    const {base} = annotation
    const dep: ClassDep<V> = new ClassDepImpl(base.id, base.info, base.target);
    acc.begin(dep)
    dep.invoker.depArgs = acc.getDeps(annotation.deps, base.id, base.info.tags)
    acc.end(dep)
}



function resolveSetter<V: Object, E>(annotation: SetterAnnotation<V>, acc: AnnotationResolver): void {
    const {base} = annotation

    const newAcc: AnnotationResolver = acc.newRoot();

    const modelDep: AnyDep = newAcc.resolve(annotation.model);
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

    acc.begin(dep)
    dep.invoker.depArgs = acc.getDeps(annotation.deps, base.id, base.info.tags)
    acc.end(dep)
}

function resolveLoader<V: Object, E>(annotation: LoaderAnnotation<V, E>, acc: AnnotationResolver): void {
    resolveFactory(((annotation: any): FactoryAnnotation<Observable<V, E>>), acc)
}

export default {
    class: resolveClass,
    factory: resolveFactory,
    model: resolveModel,
    asyncmodel: resolveModel,
    meta: resolveMeta,
    loader: resolveLoader
}
