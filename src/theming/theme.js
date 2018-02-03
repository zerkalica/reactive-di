// @flow
import type {TypedPropertyDescriptor} from '../interfaces'
import {nameId} from './JssSheetManager'

function addDebugInfo<V: Object>(obj: V): V {
    if (obj[nameId] === undefined) {
        for (let k in obj) {
            const prop = obj[k]
            if (prop && typeof prop === 'object') {
                prop[nameId] = k
            }
        }
    }
    return obj
}

function themeProp<V: Object>(
    proto: Object,
    name: string,
    descr: TypedPropertyDescriptor<V>,
    isSelf?: boolean
) {
    const className: string = proto.constructor.displayName || proto.constructor.name
    const getSheet: (() => V) | void = descr.get
    const value: V | void = descr.value
    if (getSheet === undefined && value === undefined) {
        throw new Error(`Need ${className} { @theme get ${name}() }`)
    }

    if (getSheet) {
        proto[`${name}#`] = getSheet
    }

    return {
        enumerable: descr.enumerable,
        configurable: descr.configurable,
        get(): V {
            const obj: Object = value || this[`${name}#`]()
            return (addDebugInfo(obj): any)
        }
    }
}

declare function theme<V>(): () => typeof themeProp
declare function theme<V: Object>(
    proto: Object,
    name: string,
    descr: TypedPropertyDescriptor<V>
): TypedPropertyDescriptor<*>

function themeSelf<V: Object>(
    proto: Object,
    name: string,
    descr: TypedPropertyDescriptor<V>
) {
    return themeProp(proto, name, descr, true)
}

export default function theme<V: Object>(
    proto: Object,
    name: string,
    descr: TypedPropertyDescriptor<V>
) {
    return themeProp(proto, name, descr)
}

theme.self = themeSelf
theme.fn = addDebugInfo
