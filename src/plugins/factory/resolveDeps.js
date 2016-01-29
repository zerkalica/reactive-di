/* @flow */

import type {
    DependencyResolver
    AnyDep,
    DepArgs
} from '../../nodeInterfaces'
import type {SimpleMap} from '../../modelInterfaces'
import type {
    MiddlewareFn,
    MiddlewareMap
} from '../../utils/createProxy'

export default function resolveDeps<A: MiddlewareFn|MiddlewareMap>(
    dep: DepArgs,
    acc: DependencyResolver
): {
    deps: Array<any|SimpleMap<string, any>>,
    middlewares: ?Array<A>
} {
    const {deps, depNames, middlewares} = dep
    const argsArray = []
    const argsObject = {}
    for (let i = 0, j = deps.length; i < j; i++) {
        const childDep: AnyDep = deps[i];
        const {base} = childDep
        base.resolve(childDep, acc)
        if (depNames) {
            argsObject[depNames[i]] = base.value
        } else {
            argsArray.push(base.value)
        }
    }

    let resolvedMiddlewares: ?Array<A> = null;
    if (middlewares) {
        resolvedMiddlewares = []
        for (let i = 0, j = middlewares.length; i < j; i++) {
            resolvedMiddlewares.push(acc.get(middlewares[i]))
        }
    }

    return {
        deps: depNames ? [argsObject] : argsArray,
        middlewares: resolvedMiddlewares
    }
}
