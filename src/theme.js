// @flow

import type {TypedPropertyDescriptor, ISheetManager, IDisposableSheet} from './interfaces'
import {diKey} from './interfaces'

let lastThemeId = 0

const fakeSheet: IDisposableSheet<any> = {}

function themeProp<V: Object>(
    proto: Object,
    name: string,
    descr: TypedPropertyDescriptor<V>,
    isInstance?: boolean
) {
    const className: string = proto.constructor.displayName || proto.constructor.name
    const getSheet: (() => V) | void = descr.get
    const value: V | void = descr.value
    if (getSheet === undefined && value === undefined) {
        throw new Error(`Need ${className} { @theme get ${name}() }`)
    }

    const themeId = `${className}.${name}#${++lastThemeId}`
    const atomId = `${className}.${name}()`
    if (getSheet) {
        proto[themeId] = getSheet
    }

    return {
        enumerable: descr.enumerable,
        configurable: descr.configurable,
        get(): IDisposableSheet<V> {
            ;(this: {
                [k: typeof diKey]: {
                    instance: number;
                }
            })
            const sm: ISheetManager | void = theme.sheetManager
            return sm === undefined
                ? fakeSheet
                : sm.sheet(
                    isInstance
                        ? `${themeId}[${this[diKey].instance}]`
                        : themeId,
                    value || this[themeId](),
                    !!this[atomId]
                )
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
theme.sheetManager = (undefined: ISheetManager | void)
