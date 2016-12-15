// @flow

import type {ISettable, ISource, ISourceStatus, IGetable} from './atoms/interfaces'
import {setterKey} from './atoms/interfaces'

export default function getSetter<V>(obj: Object): ISettable<V> & IGetable<V> {
    return (obj[setterKey]: ISource<V>)
}

export function getStatus(obj: Object): ISettable<ISourceStatus> & IGetable<ISourceStatus> {
    return (obj[setterKey]: ISource<*>).getStatus()
}
