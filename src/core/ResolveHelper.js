/* @flow */
import type {
    ArgsObject,
    Dependency,
    Tag,
    DepItem
} from 'reactive-di/i/annotationInterfaces'

import type {
    Resolver,
    Context
} from 'reactive-di/i/nodeInterfaces'

export default class ResolveHelper {
    _middlewares: Map<Tag|Dependency, Array<Dependency>>;
    _context: Context;

    constructor(
        middlewares: Map<Tag|Dependency, Array<Dependency>>,
        context: Context
    ) {
        this._middlewares = middlewares
        this._context = context
    }

    getMiddlewares(
        annotatedDep: Dependency,
        tags: Array<Tag>
    ): ?Array<Resolver> {
        const {_middlewares: middlewares, _context: context} = this
        const ids: Array<Dependency|Tag> = [annotatedDep].concat(tags);
        const middlewareDeps: Array<Resolver> = [];
        for (let i = 0, l = ids.length; i < l; i++) {
            const depMiddlewares: ?Array<Dependency> = middlewares.get(ids[i]);
            if (depMiddlewares) {
                for (let j = 0, k = depMiddlewares.length; j < k; j++) {
                    middlewareDeps.push(context.getResolver(depMiddlewares[j]))
                }
            }
        }

        return middlewareDeps.length ? middlewareDeps : null
    }

    getDeps(deps: Array<DepItem>): {
        deps: Array<Resolver>;
        depNames: ?Array<string>;
    } {
        const {_context: context} = this

        let depNames: ?Array<string> = null;
        const resolvedDeps: Array<Resolver> = [];
        if (deps.length) {
            if (
                typeof deps[0] === 'object'
                && deps.length === 1
            ) {
                depNames = []
                const argsObject: ArgsObject = (deps[0]: any);
                for (let key in argsObject) { // eslint-disable-line
                    resolvedDeps.push(context.getResolver(argsObject[key]))
                    depNames.push(key)
                }
            } else {
                for (let i = 0, l = deps.length; i < l; i++) {
                    const dep: Resolver = context.getResolver(((deps: any): Array<Dependency>)[i]);
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
