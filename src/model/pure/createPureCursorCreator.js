/* @flow */

import PureDataCursor from 'reactive-di/model/pure/impl/PureDataCursor'
import type {Annotation} from 'reactive-di/i/annotationInterfaces'
import type {
    Cursor,
    CursorCreator
} from 'reactive-di/i/modelInterfaces'
import setupStateAnnotations from 'reactive-di/model/pure/impl/setupStateAnnotations'

// implements CursorCreator
export default function createPureCursorCreator<S: Object>(
    map: Map<Function, Annotation>,
    state: S
): CursorCreator {
    setupStateAnnotations(map, state)
    const stateRef: {state: S} = {state};
    return function createPureCursor<V: Object>(path: Array<string>): Cursor<V> {
        return new PureDataCursor(path, stateRef)
    }
}
