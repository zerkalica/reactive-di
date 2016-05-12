/* @flow */

import type {
    Provider,
    Dependency
} from 'reactive-di'

import {
    fastCall,
    fastCreateObject
} from 'reactive-di/utils/fastCall'

import {
    createFunctionProxy,
    createObjectProxy
} from 'reactive-di/utils/createProxy'

type CallableArguments = {
    deps: Array<any>;
    depNames: ?Array<string>;
    middlewares: ?Array<any>;
}

export default class ArgumentHelper {
    _target: Dependency;
    _deps: Array<Provider>;
    _depNames: ?Array<string>;
    _middlewares: ?Array<Provider>;

    constructor(
        target: Dependency,
        deps: Array<Provider>,
        depNames: ?Array<string>,
        middlewares: ?Array<Provider>
    ) {
        this._target = target
        this._deps = deps
        this._depNames = depNames
        this._middlewares = middlewares
    }

    invokeComposed(args: Array<any>): any {
        const {deps, middlewares} = this._getArguments()
        const props = deps.concat(args)
        const result = fastCall(this._target, props);
        if (middlewares) {
            const middlewareProps = [result].concat(props)
            for (let i = 0, l = middlewares.length; i < l; i++) {
                fastCall(middlewares[i], middlewareProps)
            }
        }

        return result
    }

    invokeFunction(): any {
        const {deps, middlewares} = this._getArguments()
        let fn: any;
        fn = fastCall(this._target, deps);
        if (middlewares && typeof fn === 'function') {
            fn = createFunctionProxy(fn, middlewares)
        }

        return fn
    }

    createObject<O: Object>(): O {
        const {deps, middlewares} = this._getArguments()
        let object: O;
        object = fastCreateObject(this._target, deps);
        if (middlewares) {
            object = createObjectProxy(object, middlewares)
        }

        return object
    }

    _getArguments(): CallableArguments {
        const {_deps: deps, _depNames: depNames, _middlewares: middlewares} = this
        const argsArray = []
        const argsObject = {}

        if (depNames) {
            for (let i = 0, j = deps.length; i < j; i++) {
                const dep = deps[i]
                if (!dep.isCached) {
                    dep.update()
                    dep.isCached = true
                }
                argsObject[depNames[i]] = dep.value
            }
        } else {
            for (let i = 0, j = deps.length; i < j; i++) {
                const dep = deps[i]
                if (!dep.isCached) {
                    dep.update()
                    dep.isCached = true
                }
                argsArray[i] = dep.value
            }
        }

        let resolvedMiddlewares: ?Array<any> = null;
        if (middlewares) {
            resolvedMiddlewares = []
            for (let i = 0, j = middlewares.length; i < j; i++) {
                const dep = middlewares[i]
                if (!dep.isCached) {
                    dep.update()
                    dep.isCached = true
                }
                resolvedMiddlewares[i] = dep.value
            }
        }

        return {
            deps: depNames ? [argsObject] : argsArray,
            depNames,
            middlewares: resolvedMiddlewares
        }
    }
}
