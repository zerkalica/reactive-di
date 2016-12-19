// @flow

import {fastCallMethod, fastCall} from './fastCreate'

export type IRef<V> = {
    displayName: string;
    cached: V;
    onFunctionCall(args: any[], result: any): void;
    onMethodCall(name: string | Symbol, args: any[], result: any): void;
}

function createWrap<V: Object, R>(
    ref: IRef<V>,
    name: string | Symbol
): (...args: any[]) => R {
    function wrappedMethod(...args: any[]): R {
        const result: R = fastCallMethod(ref.cached, ref.cached[name], args)
        ref.onMethodCall(name, args, result)

        return result
    }
    wrappedMethod.displayName = name

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
        return this._ref.cached[this._propName]
    }

    set(newVal: V): void {
        this._ref.cached[this._propName] = newVal
    }
}

export function wrapFunction<V: Function>(ref: IRef<V>): V {
    function fnProxy(...args: any[]): V {
        const result = fastCall(ref.cached, args) // eslint-disable-line
        ref.onFunctionCall(args, result)
        return result
    }
    fnProxy.displayName = ref.displayName

    return (fnProxy: any)
}

export default function wrapObject<V: Object>(ref: IRef<V>): V {
    let obj: V = ref.cached
    const result: V = (Object.create(obj.constructor.prototype): any)
    const setted: Map<string | Symbol, boolean> = new Map()
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
            if (!setted.get(propName)) {
                const prop = result[propName]
                setted.set(propName, true)
                if (typeof prop === 'function') {
                    if (propName !== 'constructor') {
                        result[propName] = createWrap(ref, propName)
                    }
                } else {
                    Object.defineProperty(result, propName, new PropDescriptor(ref, propName))
                }
            }
        }
        obj = Object.getPrototypeOf(obj)
    } while (obj && Object.getPrototypeOf((obj: any)))

    return result
}
