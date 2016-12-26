// @flow

import {setterKey} from '../atoms/interfaces'
import type {ISource, INotifier} from '../atoms/interfaces'
import {fastCallMethod, fastCall} from './fastCreate'

export type IRef<V> = {
    cachedSrc: V;
    notifier: INotifier;
}
/* eslint-disable no-param-reassign */
function wrapMethod<V: Object, R>(
    ref: IRef<V>,
    name: string | Symbol
): (...args: any[]) => R {
    const notifier = ref.notifier
    const trace = notifier.trace.concat(typeof name === 'string' ? name : name.toString())
    function wrappedMethod(...args: any[]): R {
        const oldTrace = notifier.trace
        notifier.trace = trace.concat('' + ++notifier.callerId)
        const result: R = fastCallMethod(ref.cachedSrc, ref.cachedSrc[name], args)
        notifier.trace = oldTrace
        ref.notifier.end()
        return result
    }
    wrappedMethod.displayName = trace

    return wrappedMethod
}

export function wrapFunction<V: Function>(ref: IRef<V>): V {
    const notifier = ref.notifier
    const trace = notifier.trace

    function wrappedFn(...args: any[]): V {
        const oldTrace = notifier.trace
        notifier.trace = trace.concat('' + ++notifier.callerId)
        const result = fastCall(ref.cachedSrc, args) // eslint-disable-line
        notifier.trace = oldTrace
        notifier.end()
        return result
    }
    wrappedFn.displayName = trace

    return (wrappedFn: any)
}

function createSetterFn<V: Object>(
    src: ISource<V>,
    trace: string[],
    notifier: INotifier,
    key: string,
    getValue: ?(rawVal: mixed) => mixed
) {
    const setter = (rawVal: mixed) => {
        const v: mixed = getValue ? getValue(rawVal) : rawVal
        const oldTrace = notifier.trace
        notifier.trace = trace
        src.merge({[key]: v})
        notifier.trace = oldTrace
        notifier.end()
    }
    setter.displayName = notifier.trace.join('.')
    return setter
}

function fromEvent(e: any): mixed {
    return e.target.value
}

function createSetter<V: Object>(
    obj: V,
    isFromEvent?: boolean,
    propName?: string | Symbol
) {
    const src = (obj: any)[setterKey]
    const notifier = src.context.notifier
    const result = Object.create(obj.constructor)
    const propNames: string[] = Object.getOwnPropertyNames(obj)
    const trace = notifier.trace.slice(0)
    if (propName) {
        trace.push(propName)
    }
    const getValue = isFromEvent ? fromEvent : null
    for (let i = 0, l = propNames.length; i < l; i++) {
        const pn = propNames[i]
        result[pn] = createSetterFn(src, trace.concat(pn), notifier, pn, getValue)
    }

    return result
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
                    if (typeof prop === 'object' && prop[setterKey]) {
                        result[propName] = createSetter(prop, true, propName)
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
