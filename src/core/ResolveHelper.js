/* @flow */
import type {
    ArgsObject,
    DependencyKey,
    Tag,
    DepItem
} from 'reactive-di/i/coreInterfaces'

import type {
    Resolver,
    Container
} from 'reactive-di/i/coreInterfaces'

export default class ResolveHelper {
    _middlewares: Map<Tag|DependencyKey, Array<DependencyKey>>;
    _Container: Container;

    constructor(
        middlewares: Map<Tag|DependencyKey, Array<DependencyKey>>,
        Container: Container
    ) {
        this._middlewares = middlewares
        this._Container = Container
    }

    getMiddlewares(
        annotatedDep: DependencyKey,
        tags: Array<Tag>
    ): ?Array<Resolver> {
        const {_middlewares: middlewares, _Container: Container} = this
        const ids: Array<DependencyKey|Tag> = [annotatedDep].concat(tags);
        const middlewareDeps: Array<Resolver> = [];
        for (let i = 0, l = ids.length; i < l; i++) {
            const depMiddlewares: ?Array<DependencyKey> = middlewares.get(ids[i]);
            if (depMiddlewares) {
                for (let j = 0, k = depMiddlewares.length; j < k; j++) {
                    middlewareDeps.push(Container.getResolver(depMiddlewares[j]))
                }
            }
        }

        return middlewareDeps.length ? middlewareDeps : null
    }

    getDeps(deps: Array<DepItem>): {
        deps: Array<Resolver>;
        depNames: ?Array<string>;
    } {
        const {_Container: Container} = this

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
                    resolvedDeps.push(Container.getResolver(argsObject[key]))
                    depNames.push(key)
                }
            } else {
                for (let i = 0, l = deps.length; i < l; i++) {
                    const dep: Resolver =
                        Container.getResolver(((deps: any): Array<DependencyKey>)[i]);
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
