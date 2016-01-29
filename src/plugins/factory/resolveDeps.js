/* @flow */

import type {
    AnyDep,
    DepArgs
} from '../../interfaces/nodeInterfaces'
import type {SimpleMap} from '../../interfaces/modelInterfaces'
import type {
    MiddlewareFn,
    MiddlewareMap
} from '../../utils/createProxy'

export default function resolveDeps<A: MiddlewareFn|MiddlewareMap>(dep: DepArgs): {
    deps: Array<any|SimpleMap<string, any>>,
    middlewares: ?Array<A>
} {
    const {deps, depNames, middlewares} = dep
    const argsArray = []
    const argsObject = {}
    for (let i = 0, j = deps.length; i < j; i++) {
        const {base}: AnyDep = deps[i];
        base.resolve()
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
            const {base} = middlewares[i];
            base.resolve()
            resolvedMiddlewares.push(base.value)
        }
    }

    return {
        deps: depNames ? [argsObject] : argsArray,
        middlewares: resolvedMiddlewares
    }
}
