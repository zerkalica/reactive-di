// @flow

import type {IShape} from '../interfaces'

export default function defaultMerge<V: Object>(newVal: IShape<V>, oldVal: V): V {
    return Array.isArray(newVal)
        ? newVal
        : Object.assign((Object.create(oldVal.constructor.prototype): any), oldVal, newVal || {})
}
