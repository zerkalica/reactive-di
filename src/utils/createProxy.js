/* @flow */
import {fastCall, fastCallMethod} from 'reactive-di/utils/fastCall'

export type MiddlewareFn = (result: any, ...args: Array<any>) => void;
export type MiddlewareMap = {[method: string]: MiddlewareFn};

export function cloneInstance<Instance: Object>(target: Instance, props: $Shape<Instance>): Instance {
    return new target.constructor({...target, ...props})
}

export function setProps(obj: Object, props: Object): void {
    Object.assign(obj, obj.constructor.defaults, props)
}

export function createFunctionProxy<T: Function>(
    source: Function,
    middlewares: Array<MiddlewareFn>
): T {
    function functionProxy(...args: Array<any>): any {
        let res = fastCall(source, args)
        const newArgs = [res].concat(args)
        for (let i = 0, j = middlewares.length; i < j; i++) {
            const mdlRes = fastCall(middlewares[i], newArgs)
            if (mdlRes !== undefined) {
                res = mdlRes
            }
        }
        return res
    }
    functionProxy.displayName = 'proxy@' + (source.displayName || source.name)

    return ((functionProxy: any): T)
}

function createMethodProxy(
    name: string,
    source: Object,
    middlewares: Array<MiddlewareMap>
): Function {
    function methodProxy(...args: Array<any>): any {
        let res = fastCallMethod(source, source[name], args)
        const newArgs = [res].concat(args)
        for (let it = 0, jt = middlewares.length; it < jt; it++) {
            const obj = middlewares[it]
            if (obj[name]) {
                const mdlRes = fastCallMethod(obj, obj[name], newArgs)
                if (mdlRes !== undefined) {
                    res = mdlRes
                }
            }
        }
        return res
    }
    methodProxy.displayName = 'proxy@' + name

    return methodProxy
}

export function createObjectProxy<T: Object>(source: T, middlewares: Array<MiddlewareMap>): T {
    const props: Object = Object.create(source)
    const methods: Array<string> = Object.getOwnPropertyNames(Object.getPrototypeOf(source))
    for (let i = 0, j = methods.length; i < j; i++) {
        const name = methods[i]
        const method = source[name]
        if ((method instanceof Function) && (method !== source.constructor)) {
            props[name] = createMethodProxy(name, source, middlewares)
        }
    }
    return ((props: any): T)
}
