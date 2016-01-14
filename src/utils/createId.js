/* @flow */
import type {DepId} from '../interfaces'
let id: number = 0;

export default function createId(): DepId {
    return '' + (++id)
}
