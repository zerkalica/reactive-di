// @flow

import type {INotifier} from '../atoms/interfaces'
import {fastCallMethod, fastCall} from './fastCreate'

export type IRef<V> = {
    displayName: string;
    cachedSrc: V;
    notifier: INotifier;
}
/* eslint-disable no-param-reassign */
function createWrap<V: Object, R>(
    ref: IRef<V>,
    name: string | Symbol
): (...args: any[]) => R {
    function wrappedMethod(...args: any[]): R {
        ref.notifier.begin({
            names: [ref.displayName, typeof name === 'string' ? name : name.toString()],
            args,
            id: 0
        })
        const result: R = fastCallMethod(ref.cachedSrc, ref.cachedSrc[name], args)
        ref.notifier.end()

        return result
    }
    wrappedMethod.displayName = `${ref.displayName}.${String(name)}`

    return wrappedMethod
}

class PropDescriptor<V: Object> {
    _ref: IRef<V>
    _propName: string | Symbol

    constructor(ref: IRef<V>, propName: string | Symbol) {
        this._ref = ref
        this._propName = propName
    }

    get(): V {
        return this._ref.cachedSrc[this._propName]
    }

    set(newVal: V): void {
        this._ref.cachedSrc[this._propName] = newVal
    }
}

export function wrapFunction<V: Function>(ref: IRef<V>): V {
    function fnProxy(...args: any[]): V {
        ref.notifier.begin({
            names: [ref.displayName],
            args,
            id: 0
        })
        const result = fastCall(ref.cachedSrc, args) // eslint-disable-line
        ref.notifier.end()
        return result
    }
    fnProxy.displayName = ref.displayName

    return (fnProxy: any)
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
                const prop = result[propName]
                setted[propName] = true
                if (typeof prop === 'function') {
                    if (propName !== 'constructor') {
                        result[propName] = createWrap(ref, propName)
                    }
                } else if (typeof propName !== 'string' || propName[0] !== '_') {
                    Object.defineProperty(result, propName, new PropDescriptor(ref, propName))
                } else {
                    result[propName] = ref.cachedSrc[propName]
                }
            }
        }
        obj = Object.getPrototypeOf(obj)
    } while (obj && Object.getPrototypeOf((obj: any)))

    return result
}
