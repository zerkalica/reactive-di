/* @flow */

import type {
    Deps,
    Info,
    Dependency,
    AnyAnnotation,
    LoaderAnnotation,
    ModelAnnotation,
    SetterAnnotation,
    FactoryAnnotation,
    ClassAnnotation,
    MetaAnnotation
} from '../annotations/annotationInterfaces'
import type {Cursor} from '../modelInterfaces'
import {
    ClassDepImpl,
    LoaderDepImpl,
    ModelDepImpl,
    UpdaterImpl,
    FactoryDepImpl,
    SetterDepImpl,
    MetaDepImpl
} from '../nodes/nodeImpl'
import type {
    AnyDep,
    LoaderDep,
    ModelDep,
    SetterDep,
    FactoryDep,
    ClassDep,
    MetaDep
} from '../nodes/nodeInterfaces'
import type {AnnotationResolver} from './resolverInterfaces'

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
                throwLoaderError(dep.base.info)
            }
            deps.push(dep)
        } else {
            depNames = Object.keys(((annotation: any): DepMap))
            for (let j = 0, k = depNames.length; j < k; j++) {
                const dep: AnyDep = acc.resolve(((annotation: any): DepMap)[depNames[j]]);
                deps.push(dep)
                if (dep.kind === 'loader') {
                    throwLoaderError(dep.base.info)
                }
            }
        }
    }

    return {
        deps,
        depNames
    }
}

function resolveModel(annotation: ModelAnnotation, acc: AnnotationResolver): void {
    const cursor: Cursor = acc.cursorCreator.createCursor(annotation.statePath);
    const dep: ModelDep = new ModelDepImpl(
        annotation.id,
        annotation.info,
        acc.notifier,
        cursor,
        annotation.fromJS
    )

    acc.begin(dep);
    const childs: Array<Dependency> = annotation.childs;
    for (let i = 0, l = childs.length; i < l; i++) {
        dep.childs.push(acc.resolve(childs[i]))
    }
    if (annotation.loader) {
        dep.updater = new UpdaterImpl(((acc.resolve(annotation.loader): any): LoaderDep))
    }

    acc.end(dep)
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
    dep.middlewares = acc.resolveMiddlewares(annotation.id, annotation.info.tags)
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
    dep.middlewares = acc.resolveMiddlewares(annotation.id, annotation.info.tags)
    acc.end(dep)
}

function resolveLoader(annotation: LoaderAnnotation, acc: AnnotationResolver): void {
    const dep: LoaderDep = new LoaderDepImpl(
        annotation.id,
        annotation.info,
        annotation.fn,
        annotation.hooks
    );
    acc.begin(dep)
    const {deps, depNames} = getDeps(annotation.deps || [], acc)
    dep.deps = deps
    dep.depNames = depNames
    dep.middlewares = acc.resolveMiddlewares(annotation.id, annotation.info.tags)
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
    const {deps, depNames} = getDeps(annotation.deps || [], acc)
    dep.deps = deps
    dep.depNames = depNames
    dep.middlewares = acc.resolveMiddlewares(annotation.id, annotation.info.tags)

    const model: AnyDep = acc.resolve(annotation.model);
    if (model.kind !== 'model') {
        throw new Error('Not a model dep: ' + annotation.info.displayName)
    }
    dep.set = model.state.success
    acc.end(dep)
}

export default {
    model: resolveModel,
    class: resolveClass,
    factory: resolveFactory,
    meta: resolveMeta,
    setter: resolveSetter
}
