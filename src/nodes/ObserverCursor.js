/* @flow */

import type {Observer} from '../observableInterfaces'
import type {ModelState} from './nodeInterfaces'

function defaultFn(): void {}

// implements Observer
export default class ObserverCursor<V, E> {
    next: (value: V) => void;
    error: (error: E) => void;
    complete: (value: V) => void;

    constructor(cursor: ModelState<V, E>) {
        this.next = cursor.success
        this.error = cursor.error
        this.complete = defaultFn
    }
}
