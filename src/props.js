// @flow
import type {TypedPropertyDescriptor} from './interfaces'

export default function props<P: Object>(
    proto: P,
    name: string,
    descr: TypedPropertyDescriptor<*>,
) {
    proto.constructor.__lom_prop = name
    if (!descr.value && !descr.set) {
        descr.writable = true
    }
}
