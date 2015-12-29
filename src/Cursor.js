/* @flow */
import {AbstractCursor, AbstractDataCursor, AbstractPromisedCursor} from './selectorInterfaces'
import EntityMeta from './promised/EntityMeta'

export class Cursor<T: Object> extends AbstractCursor<T> {
    _data: AbstractDataCursor<T>;
    _promised: AbstractPromisedCursor;
    _success: (value: T) => void;
    _error: (reason: Error) => void;

    constructor(data: AbstractDataCursor<T>, promised: AbstractPromisedCursor) {
        super()
        this._data = data
        this._promised = promised

        this._success = function success(value: T): void {
            const needChange = !data.set(value)
            promised.success(value, needChange)
        }

        this._error = function error(reason: Error): void {
            promised.error(reason)
        }
    }

    set(value: T|Promise<T>): void {
        const {_promised: promised, _success: success, _error: error} = this
        if (typeof value.then === 'function') {
            promised.pending()
            value.then(success).catch(error)
        } else if (typeof value === 'object') {
            success(value)
        }
    }

    get(): T {
        return this._data.get()
    }

    getMeta(): EntityMeta {
        return this._promised.get()
    }
}
