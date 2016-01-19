/* @flow */

import type {
    Deps,
    Dependency,
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

export function resolveModel(annotation: ModelAnnotation): void {
    throw new Error('Dep nodes for data must be resolved in state converter')
}

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

function getDeps(depsAnnotations: Deps, acc: AnnotationResolver): {
    deps: Array<AnyDep>,
    depNames: ?Array<string>
} {
    let depNames: ?Array<string> = null;
    const deps: Array<AnyDep> = [];
    if (Array.isArray(depsAnnotations)) {
        for (let i = 0, l = depsAnnotations.length; i < l; i++) {
            deps.push(acc.resolve(depsAnnotations[i]))
        }
    } else {
        depNames = Object.keys(depsAnnotations)
        for (let i = 0, l = depNames.length; i < l; i++) {
            deps.push(acc.resolve(depsAnnotations[depNames[i]]))
        }
    }

    return {
        deps,
        depNames
    }
}

export function resolveClass(annotation: ClassAnnotation, acc: AnnotationResolver): void {
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
    dep.middlewares = resolveMiddlewares(this._middlewares[annotation.id], acc)
    acc.end(dep)
}

export function resolveFactory(annotation: FactoryAnnotation, acc: AnnotationResolver): void {
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
    dep.middlewares = resolveMiddlewares(this._middlewares[annotation.id], acc)
    acc.end(dep)
}

export function resolveMeta(annotation: MetaAnnotation, acc: AnnotationResolver): void {
    const dep: MetaDep = new MetaDepImpl(
        annotation.id,
        annotation.info
    );
    acc.begin(dep)
    const sourceDep: ModelDep = acc.resolve(annotation.source);
    dep.sources = sourceDep.childs.concat(sourceDep);
    acc.end(dep)
}

export function resolveSetter(annotation: SetterAnnotation, acc: AnnotationResolver): void {
    const dep: SetterDep = new SetterDepImpl(
        annotation.id,
        annotation.info
    );
    acc.begin(dep)
    dep.facet = acc.resolve(annotation.facet)
    dep.set = acc.resolve(annotation.model).set
    acc.end(dep)
}
