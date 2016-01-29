/* @flow */

import PureDataCursor from './PureDataCursor'
import type {Cursor, CursorCreator} from '../../interfaces/modelInterfaces'

// implements CursorCreator
export default function createPureCursorCreator<S: Object>(state: S): CursorCreator {
    const stateRef: {state: S} = {state};
    return function createPureCursor<V: Object>(path: Array<string>): Cursor<V> {
        return new PureDataCursor(path, stateRef)
    }
}
