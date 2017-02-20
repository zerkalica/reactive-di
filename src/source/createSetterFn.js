// @flow

import type {INotifier} from '../hook/interfaces'
import {setterKey} from '../interfaces'
import type {ISource} from './interfaces'

export function fromEvent(e: Event): mixed {
    e.stopPropagation()
    e.preventDefault()
    return (e.target: any).value
}

export function copy<V: Object>(src: V, rec?: {[id: $Keys<V>]: any}): V {
    return typeof src.copy === 'function'
        ? src.copy(rec || {})
        : Object.assign((Object.create(src.constructor.prototype): any), src, rec || {})
}

export function getSrc<V: Object>(obj: V): ISource<V> {
    return (obj: any)[setterKey]
}

export default function createSetterFn<V: Object>(
    src: ISource<V>,
    notifier: INotifier,
    key: string,
    getValue: ?(rawVal: mixed) => mixed
) {
    const name = src.displayName + (getValue ? '.eventSetter.' : '.setter.') + key
    function setVal(rawVal: mixed) {
        const v: mixed = getValue ? getValue(rawVal) : rawVal
        const cached = src.cached
        if (cached) {
            const obj = copy(cached)
            obj[key] = v
            const oldTrace = notifier.trace
            notifier.trace = name
            notifier.opId++
            src.set(obj)
            notifier.trace = oldTrace
            notifier.flush()
        }
    }
    setVal.displayName = name
    return setVal
}
