// @flow

import type {INotifier} from '../source/interfaces'
import {fastCallMethod, fastCall} from './fastCreate'

export interface IResolverTarget<V> {
    rawValue: V;
    displayName: string;
    notifier: INotifier;

    cached: ?V;
    get(): V;
}

/* eslint-disable no-param-reassign */
function wrapMethod<V: Object, R>(
    ref: IResolverTarget<V>,
    name: string | Symbol
): (...args: any[]) => R {
    const notifier = ref.notifier
    const traceName = ref.displayName + '.' + (typeof name === 'string' ? name : name.toString())

    function wrappedMethod(...args: any[]): R {
        const oldId = notifier.begin(traceName)
        if (!ref.cached) {
            ref.get()
        }
        const result: R = fastCallMethod(ref.rawValue, ref.rawValue[name], args)
        notifier.end(oldId)

        return result
    }

    wrappedMethod.displayName = traceName

    return wrappedMethod
}

export function wrapFunction<V: Object>(ref: IResolverTarget<V>): V {
    const notifier = ref.notifier
    function wrappedFn(...args: any[]): V {
        const oldId = notifier.begin(ref.displayName)
        if (!ref.cached) {
            ref.get()
        }
        const v = (ref.rawValue: any)
        if (typeof v !== 'function') {
            throw new Error('Can\'t wrap function, that returns not a function')
        }
        const result = fastCall(v, args) // eslint-disable-line
        notifier.end(oldId)

        return result
    }
    wrappedFn.displayName = ref.displayName

    return (wrappedFn: any)
}

function wrapCommonProperty<V: Object>(ref: IResolverTarget<V>, propName: string | Symbol) {
    return {
        set(v: V) {
            ref.rawValue[propName] = v
        },
        get(): V {
            return ref.rawValue[propName]
        }
    }
}

export default function wrapObject<V: Object>(ref: IResolverTarget<V>): V {
    let obj: V = ref.rawValue
    const result: V = (Object.create(obj.constructor.prototype): any)
    const setted: {[id: string | Symbol]: boolean} = Object.create(null)
    do {
        const propNames: (string | Symbol)[] = Object.getOwnPropertyNames(obj)
        if (Object.getOwnPropertySymbols) {
            const symbolNames: Symbol[] = Object.getOwnPropertySymbols(obj)
            for (let i = 0, l = symbolNames.length; i < l; i++) {
                propNames.push(symbolNames[i])
            }
        }

        for (let i = 0, l = propNames.length; i < l; i++) {
            const propName: string | Symbol = propNames[i]
            if (!setted[propName]) {
                const prop = obj[propName]
                setted[propName] = true
                if (typeof prop === 'function') {
                    if (propName !== 'constructor') {
                        result[propName] = wrapMethod(ref, propName)
                    }
                } else if (typeof propName === 'string' && propName[0] !== '_') {
                    if (prop && typeof prop === 'object') {
                        prop.displayName = `${ref.displayName}.${propName}`
                        result[propName] = prop
                    } else {
                        Object.defineProperty(result, propName, wrapCommonProperty(ref, propName))
                    }
                }
            }
        }
        obj = Object.getPrototypeOf(obj)
    } while (obj && Object.getPrototypeOf((obj: any)))

    return result
}
