/* @flow */

/* eslint-disable no-unused-vars */
import Promised from './Promised'
/* eslint-enable no-unused-vars */
import {AbstractCursor} from '../selectorInterfaces'

type NotifyFn = () => void;

export default class ServiceCursor<T, P: Promised<T>> extends AbstractCursor<P> {
    _cursor: AbstractCursor<T>;
    _meta: P;
    _notify: NotifyFn;

    constructor(cursor: AbstractCursor<T>, notify: NotifyFn) {
        super()
        this._cursor = cursor
        this._notify = notify
    }

    get(): P {
        return this._meta
    }

    set(meta: P): void {
        if (this._meta !== meta) {
            this._cursor.set(meta.value)
            if (meta.value === this._meta.value) {
                this._notify()
            }
            this._meta = meta
        }
    }
}
