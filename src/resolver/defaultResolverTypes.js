/* @flow */

import type {
    Deps,
    Info,
    Dependency,
    AnyAnnotation,
    ModelAnnotation,
    SetterAnnotation,
    FactoryAnnotation,
    ClassAnnotation,
    MetaAnnotation
} from '../annotations/annotationInterfaces'
import {
    ClassDepImpl,
    FactoryDepImpl,
    SetterDepImpl,
    MetaDepImpl
} from '../nodes/nodeImpl'
import type {
    AnyDep,
    ModelDep,
    SetterDep,
    FactoryDep,
    ClassDep,
    MetaDep
} from '../nodes/nodeInterfaces'
import type {AnnotationResolver} from './resolverInterfaces'

/* eslint-disable no-unused-vars */
function resolveModel(annotation: ModelAnnotation, acc: AnnotationResolver): void {
    throw new Error('Dep nodes for data must be resolved in StateBuilder')
}
/* eslint-enable no-unused-vars */

function resolveMiddlewares<A: FactoryDep|ClassDep>(
    mdls: ?Array<Dependency>,
    acc: AnnotationResolver
): ?Array<A> {
    let result: ?Array<A> = null;
    if (mdls && mdls.length) {
        result = [];
        for (let i = 0, l = mdls.length; i < l; i++) {
            result.push(acc.resolve(mdls[i]))
        }
    }

    return result
}

function throwLoaderError(info: Info): void {
    throw new Error('Loader can\'t be used as dependency of class or factory, this works async in separate "thread": '
        + info.displayName
    )
}

type DepMap = {[id: string]: Dependency};
function getDeps(depsAnnotations: Deps, acc: AnnotationResolver): {
    deps: Array<AnyDep>,
    depNames: ?Array<string>
} {
    let depNames: ?Array<string> = null;
    const deps: Array<AnyDep> = [];
    for (let i = 0, l = depsAnnotations.length; i < l; i++) {
        const annotation: Dependency|DepMap = depsAnnotations[i];
        if (typeof annotation === 'function') {
            const dep: AnyDep = acc.resolve((annotation: Dependency));
            if (dep.kind === 'loader') {
                throwLoaderError(dep.info)
            }
            deps.push(dep)
        } else {
            depNames = Object.keys(((annotation: any): DepMap))
            for (let j = 0, k = depNames.length; j < k; j++) {
                const dep: AnyDep = acc.resolve(((annotation: any): DepMap)[depNames[j]]);
                deps.push(dep)
                if (dep.kind === 'loader') {
                    throwLoaderError(dep.info)
                }
            }
        }
    }

    return {
        deps,
        depNames
    }
}

function resolveClass(annotation: ClassAnnotation, acc: AnnotationResolver): void {
    const dep: ClassDep = new ClassDepImpl(
        annotation.id,
        annotation.info,
        annotation.proto,
        annotation.hooks
    );

    acc.begin(dep)
    const {deps, depNames} = getDeps(annotation.deps || [], acc)
    dep.deps = deps
    dep.depNames = depNames
    dep.middlewares = resolveMiddlewares(acc.middlewares[annotation.id], acc)
    acc.end(dep)
}

function resolveFactory(annotation: FactoryAnnotation, acc: AnnotationResolver): void {
    const dep: FactoryDep = new FactoryDepImpl(
        annotation.id,
        annotation.info,
        annotation.fn,
        annotation.hooks
    );
    acc.begin(dep)
    const {deps, depNames} = getDeps(annotation.deps || [], acc)
    dep.deps = deps
    dep.depNames = depNames
    dep.middlewares = resolveMiddlewares(acc.middlewares[annotation.id], acc)
    acc.end(dep)
}

function resolveMeta(annotation: MetaAnnotation, acc: AnnotationResolver): void {
    const dep: MetaDep = new MetaDepImpl(
        annotation.id,
        annotation.info
    );
    acc.begin(dep)
    dep.source = acc.resolve(annotation.source);
    acc.end(dep)
}

function resolveSetter(annotation: SetterAnnotation, acc: AnnotationResolver): void {
    const dep: SetterDep = new SetterDepImpl(
        annotation.id,
        annotation.info
    );
    acc.begin(dep)
    // @todo hack: pass setter middlewares to slave facet middlewares
    acc.middlewares[annotation.facet.id] = acc.middlewares[annotation.id]
    dep.facet = acc.resolve(annotation.facet)
    dep.set = acc.resolve(annotation.model).set
    acc.end(dep)
}

export default {
    model: resolveModel,
    class: resolveClass,
    factory: resolveFactory,
    meta: resolveMeta,
    setter: resolveSetter
}
