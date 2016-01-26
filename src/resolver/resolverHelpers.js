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
    let dep: AnyDep = cache[annotation.base.id];
    if (dep) {
        const {relations} = dep.base
        const {parents} = acc.builderInfo
        for (let j = 0, k = parents.length; j < k; j++) {
            const parent: Set<DepId> = parents[j];
            for (let i = 0, l = relations.length; i < l; i++) {
                parent.add(relations[i])
            }
        }
    } else {
        const {base} = annotation
        if (!base.id) {
            base.id = createId()
        }
        const resolver: ResolverType = acc.resolvers[annotation.kind];
        resolver(annotation, acc)
        dep = cache[base.id]
    }
    return dep
}

export function resolveHelper(annotatedDep: Dependency, acc: AnnotationResolver): AnyDep {
    return resolve(annotatedDep, {...acc, parents: []})
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
        if (typeof deps[0] === 'object' && deps.length === 1) {
            depNames = []
            const argsObject: SimpleMap<string, Dependency> = ((deps[0]: any): SimpleMap<string, Dependency>);
            for (let key in argsObject) {
                resolvedDeps.push(resolve(argsObject[key], acc))
                depNames.push(key)
            }
        } else {
            for (let i = 0, l = deps.length; i < l; i++) {
                resolvedDeps.push(resolve(((deps: any): Array<Dependency>)[i], acc))
            }
        }
    }

    const middlewares: ?Array<AnyDep> = resolveMiddlewares(id, tags, acc.middlewares, acc);
    return new DepArgsImpl(resolvedDeps, depNames, middlewares)
}
