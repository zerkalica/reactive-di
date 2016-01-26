/* @flow */
import type {
    DepId,
    Deps,
    Dependency,
    AnyAnnotation
} from '../annotations/annotationInterfaces'
import type {
    DepArgs,
    AnyDep
} from '../nodes/nodeInterfaces'
import type {SimpleMap} from '../modelInterfaces'
import type {
    ResolverType,
    AnnotationResolver
} from './resolverInterfaces'
import createId from '../utils/createId'
import {DepArgsImpl} from '../nodes/nodeImpl'

export function resolve(annotatedDep: Dependency, acc: AnnotationResolver): AnyDep {
    const annotation: AnyAnnotation = acc.driver.get(annotatedDep);
    const {cache} = acc.builderInfo
    let id = annotation.base.id
    if (!id) {
        id = annotation.base.id = createId()
    }
    let dep: AnyDep = cache[id];
    if (!dep) {
        const resolver: ResolverType = acc.resolvers[annotation.kind];
        resolver(annotation, acc)
        dep = cache[id]
    }
    return dep
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
            middlewareDeps.push(resolve(depMiddlewares[j], acc))
        }

    }

    return middlewareDeps.length ? middlewareDeps : null
}

export function getDeps(
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
                resolvedDeps.push(resolve(argsObject[key], acc))
                depNames.push(key)
            }
        } else {
            for (let i = 0, l = deps.length; i < l; i++) {
                resolvedDeps.push(resolve((deps: Array<Dependency>)[i], acc))
            }
        }
    }

    const middlewares: ?Array<AnyDep> = resolveMiddlewares(id, tags, acc.middlewares, acc);
    return new DepArgsImpl(resolvedDeps, depNames, middlewares)
}
