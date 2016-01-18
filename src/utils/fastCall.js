/* @flow */

export function fastCreateObject<T>(target: Class<T>, args: Array<any>): T {
    /* eslint-disable new-cap */
    switch (args.length) {
    case 0:
        return new (target: any)
    case 1:
        return new (target: any)(args[0])
    case 2:
        return new (target: any)(args[0], args[1])
    case 3:
        return new (target: any)(args[0], args[1], args[2])
    case 4:
        return new (target: any)(args[0], args[1], args[2], args[3])
    case 5:
        return new (target: any)(args[0], args[1], args[2], args[3], args[4])
    case 6:
        return new (target: any)(args[0], args[1], args[2], args[3], args[4], args[5])
    case 7:
        return new (target: any)(args[0], args[1], args[2], args[3], args[4], args[5], args[6])
    default:
        return new (target: any)(...args)
    }
    /* eslint-enable new-cap */
}

export function fastCallMethod<T>(obj: Object, fn: Function, args: Array<any>): T {
    /* eslint-disable new-cap */
    switch (args.length) {
    case 0:
        return fn.call(obj)
    case 1:
        return fn.call(obj, args[0])
    case 2:
        return fn.call(obj, args[0], args[1])
    case 3:
        return fn.call(obj, args[0], args[1], args[2])
    case 4:
        return fn.call(obj, args[0], args[1], args[2], args[3])
    case 5:
        return fn.call(obj, args[0], args[1], args[2], args[3], args[4])
    case 6:
        return fn.call(obj, args[0], args[1], args[2], args[3], args[4], args[5])
    case 7:
        return fn.call(obj, args[0], args[1], args[2], args[3], args[4], args[5], args[6])
    default:
        return fn.apply(obj, args)
    }
    /* eslint-enable new-cap */
}

export function fastCall<T>(fn: Function, args: Array<any>): T {
    /* eslint-disable new-cap */
    switch (args.length) {
    case 0:
        return fn()
    case 1:
        return fn(args[0])
    case 2:
        return fn(args[0], args[1])
    case 3:
        return fn(args[0], args[1], args[2])
    case 4:
        return fn(args[0], args[1], args[2], args[3])
    case 5:
        return fn(args[0], args[1], args[2], args[3], args[4])
    case 6:
        return fn(args[0], args[1], args[2], args[3], args[4], args[5])
    case 7:
        return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6])
    default:
        return fn(...args)
    }
    /* eslint-enable new-cap */
}
