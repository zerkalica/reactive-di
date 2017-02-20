// @flow

import type {INotifier} from '../hook/interfaces'
import {fastCallMethod, fastCall} from '../utils/fastCreate'

export type IRef<V> = {
    displayName: string;
    cachedSrc: V;
    cached: ?V;
    get(): V;
    notifier: INotifier;
}

/* eslint-disable no-param-reassign */
function wrapMethod<V: Object, R>(
    ref: IRef<V>,
    name: string | Symbol
): (...args: any[]) => R {
    const notifier = ref.notifier
    const traceName = ref.displayName + '.' + (typeof name === 'string' ? name : name.toString())
    function wrappedMethod(...args: any[]): R {
        const oldTrace = notifier.trace
        notifier.trace = traceName
        notifier.opId++
        if (!ref.cached) {
            ref.get()
        }
        const result: R = fastCallMethod(ref.cachedSrc, ref.cachedSrc[name], args)
        notifier.trace = oldTrace
        notifier.flush()
        return result
    }
    wrappedMethod.displayName = traceName

    return wrappedMethod
}

export function wrapFunction<V: Function>(ref: IRef<V>): V {
    const notifier = ref.notifier
    function wrappedFn(...args: any[]): V {
        const oldTrace = notifier.trace
        notifier.trace = ref.displayName
        notifier.opId++
        if (!ref.cached) {
            ref.get()
        }
        const result = fastCall(ref.cachedSrc, args) // eslint-disable-line
        notifier.trace = oldTrace
        notifier.flush()
        return result
    }
    wrappedFn.displayName = ref.displayName

    return (wrappedFn: any)
}

function wrapCommonProperty<V: Object>(ref: IRef<V>, propName: string | Symbol) {
    return {
        set(v: V) {
            ref.cachedSrc[propName] = v
        },
        get(): V {
            return ref.cachedSrc[propName]
        }
    }
}

export default function wrapObject<V: Object>(ref: IRef<V>): V {
    let obj: V = ref.cachedSrc
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
                    if (prop && typeof prop === 'object' && prop.__rdiSetter) {
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
