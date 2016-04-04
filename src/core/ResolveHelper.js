/* @flow */
import type {
    Dependency,
    Tag,
    SimpleMap,
    DepItem
} from 'reactive-di/i/annotationInterfaces'

import type {
    ResolvableDep,
    GetResolvableDep
} from 'reactive-di/i/nodeInterfaces'

export default class ResolveHelper {
    _middlewares: Map<Tag|Dependency, Array<Dependency>>;
    _resolve: GetResolvableDep;

    constructor(
        middlewares: Map<Tag|Dependency, Array<Dependency>>,
        resolve: GetResolvableDep
    ) {
        this._middlewares = middlewares
        this._resolve = resolve
    }

    getMiddlewares(
        annotatedDep: Dependency,
        tags: Array<Tag>
    ): ?Array<ResolvableDep> {
        const {_middlewares: middlewares, _resolve: resolve} = this

        const ids: Array<Dependency|Tag> = [annotatedDep].concat(tags);
        const middlewareDeps: Array<ResolvableDep> = [];
        for (let i = 0, l = ids.length; i < l; i++) {
            const depMiddlewares: ?Array<Dependency> = middlewares.get(ids[i]);
            if (depMiddlewares) {
                for (let j = 0, k = depMiddlewares.length; j < k; j++) {
                    middlewareDeps.push(resolve(depMiddlewares[j]))
                }
            }
        }

        return middlewareDeps.length ? middlewareDeps : null
    }

    getDeps(deps: Array<DepItem>): {
        deps: Array<ResolvableDep>;
        depNames: ?Array<string>;
    } {
        const {_resolve: resolve} = this

        let depNames: ?Array<string> = null;
        const resolvedDeps: Array<ResolvableDep> = [];
        if (deps.length) {
            if (
                typeof deps[0] === 'object'
                && deps.length === 1
            ) {
                depNames = []
                const argsObject: SimpleMap<string, Dependency> =
                    ((deps[0]: any): SimpleMap<string, Dependency>);
                for (let key in argsObject) { // eslint-disable-line
                    resolvedDeps.push(resolve(argsObject[key]))
                    depNames.push(key)
                }
            } else {
                for (let i = 0, l = deps.length; i < l; i++) {
                    const dep: ResolvableDep = resolve(((deps: any): Array<Dependency>)[i]);
                    resolvedDeps.push(dep)
                }
            }
        }

        return {
            deps: resolvedDeps,
            depNames
        }
    }

}
