/* @flow */

import PureDataCursor from './PureDataCursor'
import type {Cursor, CursorCreator} from '../modelInterfaces'

// implements CursorCreator
export default class PureCursorCreator<S: Object> {
    _stateRef: {state: S};

    constructor(state: S) {
        this._stateRef = {state}
    }

    createCursor(path: Array<string>): Cursor {
        return new PureDataCursor(path, this._stateRef)
    }
}
