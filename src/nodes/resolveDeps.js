/* @flow */

import type {
    DepProcessor
    AnyDep,
    ClassDep,
    FactoryDep,
    Invoker
} from './nodeInterfaces'

import type {SimpleMap} from '../modelInterfaces'
import type {MiddlewareFn, MiddlewareMap} from '../utils/createProxy'

export default function resolveDeps<A: MiddlewareFn|MiddlewareMap>(
    dep: Invoker,
    acc: DepProcessor
): {
    deps: Array<AnyDep|SimpleMap<string, AnyDep>>,
    middlewares: ?Array<A>
} {
    const {deps, middlewares} = dep
    const depNames: ?Array<string> = dep.depNames;
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
