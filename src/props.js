// @flow
import type {TypedPropertyDescriptor} from './interfaces'
import {rdiProp} from './interfaces'

export default function props<P: Object>(
    proto: P,
    name: string,
    descr: TypedPropertyDescriptor<*>,
) {
    proto.constructor[rdiProp] = name
    if (!descr.value && !descr.set) {
        descr.writable = true
    }
}
