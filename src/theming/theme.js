// @flow

import type {TypedPropertyDescriptor} from '../interfaces'
import {rdiInst} from '../interfaces'
import type {ISheetManager} from './interfaces'

let lastThemeId = 0

const fakeSheet = {}

interface Injector {
    instance: number;
    displayName: string;
}

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

    if (getSheet) {
        proto[`${name}#`] = getSheet
    }

    return {
        enumerable: descr.enumerable,
        configurable: descr.configurable,
        get(): V {
            const sm: ISheetManager | void = theme.sheetManager
            const di: Injector = this[rdiInst]
            return sm === undefined
                ? (fakeSheet: any)
                : sm.sheet(
                    di.displayName + (isInstance ? `[${di.instance}]` : ''),
                    value || this[`${name}#`](),
                    !!this[`${name}()`]
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
