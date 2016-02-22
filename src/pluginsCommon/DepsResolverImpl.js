/* @flow */
import type {
    Tag,
    Dependency,
    Deps
} from 'reactive-di/i/annotationInterfaces'

import type {SimpleMap} from 'reactive-di/i/modelInterfaces'

import type {
    AnyDep,
    AnnotationResolver,
    DepsResolver, // eslint-disable-line
    DepArgs
} from 'reactive-di/i/nodeInterfaces'

export type ResolveDepsResult<A> = {
    deps: Array<any|SimpleMap<string, any>>,
    middlewares: ?Array<A>
}

// implements DepsResolver
export default class DepsResolverImpl {
    _acc: AnnotationResolver;

    constructor(acc: AnnotationResolver) {
        this._acc = acc
    }

    _getMiddlewares(annotatedDep: Dependency, tags: Array<Tag>): ?Array<AnyDep> {
        const {_acc: acc} = this
        const {middlewares} = acc
        const ids: Array<Dependency|Tag> = [annotatedDep].concat(tags);
        const middlewareDeps: Array<AnyDep> = [];
        for (let i = 0, l = ids.length; i < l; i++) {
            const depMiddlewares: ?Array<Dependency> = middlewares.get(ids[i]);
            if (depMiddlewares) {
                for (let j = 0, k = depMiddlewares.length; j < k; j++) {
                    middlewareDeps.push(acc.resolve(depMiddlewares[j]))
                }
            }
        }

        return middlewareDeps.length ? middlewareDeps : null
    }

    getDeps(
        deps: ?Deps,
        annotatedDep: Dependency,
        tags: Array<Tag>
    ): DepArgs {
        const {_acc: acc} = this
        let depNames: ?Array<string> = null;
        const resolvedDeps: Array<AnyDep> = [];
        if (deps && deps.length) {
            if (
                typeof deps[0] === 'object'
                && deps.length === 1
            ) {
                depNames = []
                const argsObject: SimpleMap<string, Dependency> =
                    ((deps[0]: any): SimpleMap<string, Dependency>);
                for (let key in argsObject) { // eslint-disable-line
                    resolvedDeps.push(acc.resolve(argsObject[key]))
                    depNames.push(key)
                }
            } else {
                for (let i = 0, l = deps.length; i < l; i++) {
                    const dep: AnyDep = acc.resolve(((deps: any): Array<Dependency>)[i]);
                    resolvedDeps.push(dep)
                }
            }
        }

        return {
            deps: resolvedDeps,
            depNames,
            middlewares: this._getMiddlewares(annotatedDep, tags)
        }
    }
}
