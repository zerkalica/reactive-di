/* @flow */

import PureDataCursor from '~/model/pure/impl/PureDataCursor'
import type {AnnotationDriver} from 'reactive-di/i/annotationInterfaces'
import type {
    Cursor,
    CursorCreator
} from 'reactive-di/i/modelInterfaces'
import setupStateAnnotations from '~/model/pure/impl/setupStateAnnotations'

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
