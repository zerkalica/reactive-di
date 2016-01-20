/* @flow */
import type {DepId} from '../annotations/annotationInterfaces'
let id: number = 0;

export default function createId(): DepId {
    return '' + (++id)
}
