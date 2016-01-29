/* @flow */
import type {DepId} from '../annotationInterfaces'
let id: number = 0;

export default function createId(): DepId {
    return '' + (++id)
}
