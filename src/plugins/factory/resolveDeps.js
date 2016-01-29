/* @flow */

import type {
    DependencyResolver
    AnyDep
} from '../../nodeInterfaces'
import type {DepArgs} from './factoryInterfaces'
import type {SimpleMap} from '../../modelInterfaces'
import type {
    MiddlewareFn,
    MiddlewareMap
} from '../../utils/createProxy'

export default function resolveDeps<A: MiddlewareFn|MiddlewareMap>(
    dep: DepArgs,
    acc: DependencyResolver
): {
    deps: Array<AnyDep|SimpleMap<string, AnyDep>>,
    middlewares: ?Array<A>
} {
    const {deps, depNames, middlewares} = dep
    const argsArray = []
    const argsObject = {}
    for (let i = 0, j = deps.length; i < j; i++) {
        const childDep: AnyDep = deps[i];
        const value = acc.resolve(childDep)
        if (depNames) {
            argsObject[depNames[i]] = value
        } else {
            argsArray.push(value)
        }
    }

    let resolvedMiddlewares: ?Array<A> = null;
    if (middlewares) {
        resolvedMiddlewares = []
        for (let i = 0, j = middlewares.length; i < j; i++) {
            resolvedMiddlewares.push(acc.resolve(middlewares[i]))
        }
    }

    return {
        deps: depNames ? [argsObject] : argsArray,
        middlewares: resolvedMiddlewares
    }
}
