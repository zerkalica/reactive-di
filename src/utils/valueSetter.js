// @flow

import type {ISource, ISettable} from '../atoms/interfaces'
import {setterKey} from '../atoms/interfaces'

class ValueProxy<V> {
    _flush: boolean
    _setter: ISettable<V>

    constructor(setter: ISettable<V>, noFlush: boolean) {
        this._flush = !!noFlush
        this._setter = setter
    }

    apply(target: any, that: any, args: Object[]) {
        this._setter.merge(args[0], this._flush)
    }

    get(target: any, name: string): any {
        const flush = this._flush
        const setter = this._setter
        return function setVal(v: mixed): void {
            setter.merge({[name]: v}, flush)
        }
    }
}

function empty() {}

export type SetterResult<V: Object> = {
    (v: $Shape<$Subtype<V>>): void;
    [id: $Keys<V>]: (v: mixed) => void;
}

export default function valueSetter<V: Object>(
    v: V,
    noFlush?: boolean,
    _status?: boolean
): SetterResult<V> {
    let setter: ISource<V> = (v: any)[setterKey]
    if (_status) {
        setter = setter.getStatus()
    }
    return (new Proxy(
        empty,
        (new ValueProxy(
            setter,
            noFlush || false
        ): any)
    ): any)
}

export function statusSetter<V: Object>(v: V, noFlush?: boolean): SetterResult<V> {
    return valueSetter(v, noFlush, true)
}
