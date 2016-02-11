/* @flow */

import type {
    AnyDep,
    DepArgs
} from '../../interfaces/nodeInterfaces'
import type {SimpleMap} from '../../interfaces/modelInterfaces'
import type {
    MiddlewareFn, // eslint-disable-line
    MiddlewareMap // eslint-disable-line
} from '../../utils/createProxy'

export type ResolveDepsResult<A> = {
    deps: Array<any|SimpleMap<string, any>>,
    middlewares: ?Array<A>
}

export default function resolveDeps<A: MiddlewareFn|MiddlewareMap>(
    ownerDep: DepArgs
): ResolveDepsResult<A> {
    const {deps, depNames, middlewares} = ownerDep
    const argsArray = []
    const argsObject = {}
    for (let i = 0, j = deps.length; i < j; i++) {
        const dep: AnyDep = deps[i];
        if (depNames) {
            argsObject[depNames[i]] = dep.resolve()
        } else {
            argsArray.push(dep.resolve())
        }
    }

    let resolvedMiddlewares: ?Array<A> = null;
    if (middlewares) {
        resolvedMiddlewares = []
        for (let i = 0, j = middlewares.length; i < j; i++) {
            resolvedMiddlewares.push(middlewares[i].resolve())
        }
    }

    return {
        deps: depNames ? [argsObject] : argsArray,
        middlewares: resolvedMiddlewares
    }
}
