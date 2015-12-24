/* @flow */

import Promised from './Promised'
import {AbstractCursor} from '../selectorInterfaces'

export default class ServiceCursor<T> {
    _cursor: AbstractCursor<T>;
    _meta: Promised<T>;

    constructor(cursor: AbstractCursor<T>) {
        this._cursor = cursor
    }

    get(): Promised<T> {
        return this._meta
    }

    set(meta: Promised<T>): void {
        if (this._meta !== meta) {
            this._cursor.set(meta.value)
            this._meta = meta
            if (meta.value !== this._meta.value) {
                this._notify()
            }
        }
    }
}
