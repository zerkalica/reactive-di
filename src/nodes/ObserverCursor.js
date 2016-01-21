/* @flow */

import type {Observer} from '../observableInterfaces'
import type {ModelState} from './nodeInterfaces'

function defaultFn() {}

// implements Observer
export default class ObserverCursor<T> {
    next: (value: T) => void;
    error: (error: Error) => void;
    complete: (value: T) => void;

    constructor(cursor: ModelState<T>) {
        this.next = cursor.success
        this.error = cursor.error
        this.complete = defaultFn
    }
}
