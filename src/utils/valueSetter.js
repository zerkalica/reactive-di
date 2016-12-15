// @flow

import type {ISettable} from '../atoms/interfaces'
import {setterKey} from '../atoms/interfaces'

class ValueProxy<V> {
    _flush: boolean
    _setter: ISettable<V>

    constructor(setter: ISettable<V>, noFlush: boolean) {
        this._flush = !!noFlush
        this._setter = setter
    }

    get(target: any, name: string): any {
        const flush = this._flush
        const setter = this._setter

        return function setVal(v: mixed): void {
            setter.merge({[name]: v}, flush)
        }
    }
}

export default function valueSetter<V: {[id: string]: mixed}>(
    v: V,
    noFlush?: boolean
): {[id: $Keys<V>]: (v: mixed) => void} {
    return (new Proxy(
        v,
        (new ValueProxy(
            ((v: any)[setterKey]: ISettable<V>),
            noFlush || false
        ): any)
    ): any)
}
