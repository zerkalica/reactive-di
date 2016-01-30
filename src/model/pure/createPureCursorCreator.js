/* @flow */

import PureDataCursor from './impl/PureDataCursor'
import type {AnnotationDriver} from '../../interfaces/annotationInterfaces'
import type {
    Cursor,
    CursorCreator
} from '../../interfaces/modelInterfaces'
import setupStateAnnotations from './impl/setupStateAnnotations'

// implements CursorCreator
export default function createPureCursorCreator<S: Object>(
    driver: AnnotationDriver,
    state: S
): CursorCreator {
    setupStateAnnotations(driver, state)
    const stateRef: {state: S} = {state};
    return function createPureCursor<V: Object>(path: Array<string>): Cursor<V> {
        return new PureDataCursor(path, stateRef)
    }
}
