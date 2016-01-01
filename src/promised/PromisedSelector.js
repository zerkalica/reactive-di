/* @flow */

import type {DepId} from '../interfaces'
import PromisedCursor from './PromisedCursor'

export default class PromisedSelector {
    constructor() {

    }

    select(id: DepId): PromisedCursor {
        function notify() {

        }
        return new PromisedCursor(notify)
    }
}
