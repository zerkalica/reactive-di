/* @flow */

import type {
    AnyDep,
    DepArgs
} from 'reactive-di/i/nodeInterfaces'
import type {SimpleMap} from 'reactive-di/i/modelInterfaces'
import type {
    MiddlewareFn,
    MiddlewareMap
} from 'reactive-di/utils/createProxy'

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
            const mdl: AnyDep = middlewares[i];
            if (mdl.kind !== 'factory' || mdl.kind !== 'class') {
                throw new Error(`Not an factor or class: ${mdl.base.info.displayName}`)
            }
            resolvedMiddlewares.push(mdl.resolve())
        }
    }

    return {
        deps: depNames ? [argsObject] : argsArray,
        middlewares: resolvedMiddlewares
    }
}
