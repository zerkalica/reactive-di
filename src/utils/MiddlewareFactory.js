// @flow

import {fastCallMethod} from 'reactive-di/utils/fastCall'
import debugName from 'reactive-di/utils/debugName'

export interface ArgsInfo {
    id: string;
    type: string;
    className: ?string;
    propName: string;
}
export interface Middleware {
    get?: <R: any>(value: R, info: ArgsInfo) => R;
    set?: <R: any>(oldValue: R, newValue: R, info: ArgsInfo) => R;
    exec?: <R: any>(resolve: (...args: any[]) => R, args: any[], info: ArgsInfo) => R;
}

type OrigFn<R> = (...args: any[]) => R
type Wrap = (type: string, origMethod: OrigFn<*>, obj?: ?Object) => OrigFn<*>

function createExec<R>(middleware: Middleware, method: OrigFn<R>, info: ArgsInfo): (args: any[]) => R {
    return function exec(args: any[]): R {
        return (middleware.exec: any)(method, args, info)
    }
}

class ProxyHandlers<T: Object> {
    _wrapper: MiddlewareWrapper

    constructor(wrapper: MiddlewareWrapper) {
        this._wrapper = wrapper
    }

    get(target: T, key: string, receiver: Proxy<T>): any {
        const prop: mixed = target[key]
        if (typeof prop === 'function') {
            return this._wrapper.wrapFn(target[key], target)
        }
        return this._wrapper.get(target[key], key, target)
    }

    set(target: T, key: string, value: mixed): boolean {
        const newValue = this._wrapper.set(value, key, target)
        target[key] = newValue
        return true
    }
}

class ArgsInfoImpl {
    type: string
    id: string
    propName: string
    className: ?string

    constructor(type: string, obj: ?Object, method: Function|string) {
        const propName: string = typeof method === 'string'
            ? method
            : method.displayName || method.name

        const className: ?string = obj
            ? (obj.displayName || obj.name || obj.constructor.displayName || obj.constructor.name)
            : null

        this.type = type
        this.id = className ? `${className}.${propName}` : propName
        this.className = className
        this.propName = propName
    }
}

class MiddlewareWrapper {
    _middlewares: Middleware[]
    _type: string
    _wrappers: Map<mixed, any> = new Map()

    constructor(middlewares: Middleware[], type: string) {
        this._middlewares = middlewares
        this._type = type
    }

    get<R>(value: R, propName: string, obj: Object): R {
        const middlewares = this._middlewares
        const info: ArgsInfo = new ArgsInfoImpl(this._type, obj, propName)
        let newValue: R = value
        for (let i = 0, l = middlewares.length; i < l; i++) {
            const middleware: Middleware = middlewares[i]
            if (middleware.get) {
                newValue = middleware.get(newValue, info)
                if (newValue === undefined) {
                    throw new Error(`${debugName(middleware)}.get can't return undefined`)
                }
            }
        }

        return newValue
    }

    set<R>(value: R, propName: string, obj: Object): R {
        const middlewares = this._middlewares
        const info: ArgsInfo = new ArgsInfoImpl(this._type, obj, propName)
        let newValue: R = value
        const oldValue: R = obj[propName]
        for (let i = 0, l = middlewares.length; i < l; i++) {
            const middleware: Middleware = middlewares[i]
            if (middleware.set) {
                newValue = middleware.set(oldValue, newValue, info)
                if (newValue === undefined) {
                    throw new Error(`${debugName(middleware)}.set can't return undefined`)
                }
            }
        }

        return newValue
    }

    wrapFn<F: Function>(origMethod: F, obj?: ?Object): F {
        if (!this._middlewares.length) {
            return origMethod
        }
        let wrapped = this._wrappers.get(origMethod)
        if (wrapped) {
            return wrapped
        }
        function methodProxy(args: any[]): any {
            return fastCallMethod(obj, origMethod, args)
        }
        let method: OrigFn<*> = methodProxy
        const info: ArgsInfo = new ArgsInfoImpl(this._type, obj, origMethod)
        const middlewares = this._middlewares
        for (let i = 0, l = middlewares.length; i < l; i++) {
            const middleware: Middleware = middlewares[i]
            if (middleware.exec) {
                if (!middleware.type) {
                    method = createExec(middleware, method, info)
                }
            }
        }
        if (method === methodProxy) {
            this._wrappers.set(origMethod, origMethod)
            return origMethod
        }
        wrapped = function _wrapped(...args: any[]): any {
            return method(args)
        }
        wrapped.displayName = info.id
        this._wrappers.set(origMethod, wrapped)
        return (wrapped: any)
    }

    wrapObject<O: Object>(source: O): O {
        if (!this._middlewares.length) {
            return source
        }
        let newSource: ?O = this._wrappers.get(source)
        if (!newSource) {
            newSource = new Proxy(source, (new ProxyHandlers(this): any))
            this._wrappers.set(source, newSource)
        }
        return newSource
    }
}

export default class MiddlewareFactory {
    _middlewares: Middleware[]

    constructor(middlewares: Middleware[], noReverse?: boolean) {
        if (noReverse) {
            this._middlewares = middlewares
        } else {
            this._middlewares = [].concat(middlewares)
            this._middlewares.reverse()
        }
    }

    copy(middlewares: Middleware[]): MiddlewareFactory {
        const newMiddlewares = [].concat(middlewares)
        newMiddlewares.reverse()
        return new MiddlewareFactory(newMiddlewares.concat[this._middlewares], true)
    }

    wrap<R>(value: R, type: string): R {
        const wrapper = new MiddlewareWrapper(this._middlewares, type)
        switch (typeof value) {
            case 'function':
                return wrapper.wrapFn(value)
            case 'object':
                return value ? wrapper.wrapObject(value) : value
            default:
                return value
        }
    }
}
