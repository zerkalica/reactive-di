/* @flow */
import type {
    ArgsObject,
    DependencyKey,
    Tag,
    DepItem,
    Resolver,
    Container
} from 'reactive-di/i/coreInterfaces'

export default class ResolveHelper {
    _middlewares: Map<Tag|DependencyKey, Array<DependencyKey>>;
    _container: Container;

    constructor(
        middlewares: Map<Tag|DependencyKey, Array<DependencyKey>>,
        container: Container
    ) {
        this._middlewares = middlewares
        this._container = container
    }

    getMiddlewares(
        annotatedDep: DependencyKey,
        tags: Array<Tag>
    ): ?Array<Resolver> {
        const {_middlewares: middlewares, _container: container} = this
        const ids: Array<DependencyKey|Tag> = [annotatedDep].concat(tags);
        const middlewareDeps: Array<Resolver> = [];
        for (let i = 0, l = ids.length; i < l; i++) {
            const depMiddlewares: ?Array<DependencyKey> = middlewares.get(ids[i]);
            if (depMiddlewares) {
                for (let j = 0, k = depMiddlewares.length; j < k; j++) {
                    middlewareDeps.push(container.getResolver(depMiddlewares[j]))
                }
            }
        }

        return middlewareDeps.length ? middlewareDeps : null
    }

    getDeps(deps: Array<DepItem>): {
        deps: Array<Resolver>;
        depNames: ?Array<string>;
    } {
        const {_container: container} = this

        let depNames: ?Array<string>;
        const resolvedDeps: Array<Resolver> = [];
        const l: number = deps.length;
        if (
            l === 1
            && typeof deps[0] === 'object'
        ) {
            depNames = []
            const argsObject: ArgsObject = (deps[0]: any);
            for (let key in argsObject) { // eslint-disable-line
                resolvedDeps.push(container.getResolver(argsObject[key]))
                depNames.push(key)
            }
        } else {
            depNames = null
            for (let i = 0; i < l; i++) {
                const dep: Resolver =
                    container.getResolver(((deps: any): Array<DependencyKey>)[i]);
                resolvedDeps.push(dep)
            }
        }

        return {
            deps: resolvedDeps,
            depNames
        }
    }
}
