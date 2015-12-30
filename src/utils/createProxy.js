/* @flow */

type MiddlewareFn = (result: any, ...args: Array<any>) => void;
type MiddlewareMap = {[method: string]: MiddlewareFn};

function createFunctionProxy(source: Function, middlewares: Array<MiddlewareFn>): Function {
    function functionProxy(...args: Array<any>): any {
        let res = source(args[0], args[1], args[2], args[3], args[4], args[5])
        for (let i = 0, j = middlewares.length; i < j; i++) {
            const mdlRes = middlewares[i](res, args[0], args[1], args[2], args[3], args[4], args[5])
            if (mdlRes !== undefined) {
                res = mdlRes
            }
        }
        return res
    }
    functionProxy.displayName = 'proxy@' + (source.displayName || source.name)

    return functionProxy
}

function createMethodProxy(
    name: string,
    source: Object,
    middlewares: Array<MiddlewareMap>
): Function {
    function methodProxy(...args: Array<any>): any {
        let res = source[name].call(source, args[0], args[1], args[2], args[3], args[4], args[5])
        for (let it = 0, jt = middlewares.length; it < jt; it++) {
            const obj = middlewares[it]
            if (obj[name]) {
                const mdlRes = obj[name].call(obj, res, args[0], args[1], args[2], args[3], args[4], args[5])
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

function createObjectProxy(source: Object, middlewares: Array<MiddlewareMap>): Object {
    const props: {[prop: string]: Function} = Object.create(source);
    const methods: Array<string> = Object.getOwnPropertyNames(Object.getPrototypeOf(source));
    for (let i = 0, j = methods.length; i < j; i++) {
        const name = methods[i]
        const method = source[name]
        if ((method instanceof Function) && (method !== source.constructor)) {
            props[name] = createMethodProxy(name, source, middlewares)
        }
    }
    return props
}

export default function createProxy(
    source: Function|Object,
    middlewares: Array<any>
): any {
    let result
    if (typeof source === 'object') {
        result = createObjectProxy((source: Object), (middlewares: Array<MiddlewareMap>));
    } else {
        result = createFunctionProxy((source: Function), (middlewares: Array<MiddlewareFn>));
    }
    return result
}
