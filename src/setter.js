// @flow

import type {ISettable, ISource, ISourceStatus, IGetable} from './atoms/interfaces'
import {setterKey} from './atoms/interfaces'

export type Setter<V: Object> = {
    // (v: $Shape<$Subtype<V>>): void;
    [id: $Keys<V>]: (v: mixed) => void;
}

export default function setter<V: Object>(obj: Object): Setter<V> {
    return (obj[setterKey]: ISource<V>).setter || (obj[setterKey]: ISource<V>).getSetter()
}

export function eventSetter<V: Object>(obj: Object): Setter<V> {
    return (obj[setterKey]: ISource<V>).eventSetter || (obj[setterKey]: ISource<V>).getEventSetter()
}

export function status(obj: Object): ISettable<ISourceStatus> & IGetable<ISourceStatus> {
    return (obj[setterKey]: ISource<*>).getStatus()
}

export function merge<V: Object>(obj: Object, newData: $Shape<V>): void {
    (obj[setterKey]: ISource<V>).merge(newData)
}

export function set<V: Object>(newData: V): void {
    (newData[setterKey]: ISource<V>).set(newData)
}

export function reset(newData: Object): void {
    (newData[setterKey]: ISource<Object>).merge(new newData.constructor())
}
