/* @flow */
import EntityMeta from './promised/EntityMeta'
import {AbstractDataCursor} from './selectorInterfaces'

export default class CacheRec<T: Object> {
    value: any;
    reCalculate: boolean;
    meta: EntityMeta;
    _originMeta: EntityMeta;

    setValue: (value: any) => void;

    _success: (value: T) => void;
    _error: (reason: Error) => void;
    setPending: () => void;

    _cursor: AbstractDataCursor<T>;

    _notify: () => void;

    relations: Array<CacheRec>;

    constructor(
        cursor: AbstractDataCursor<T>,
        notify: () => void,
        value: any = null,
        reCalculate: boolean = true
    ) {
        this._cursor = cursor
        this._notify = notify
        this.value = value
        this.reCalculate = reCalculate
        this.meta = new EntityMeta()
        this._originMeta = new EntityMeta()
        this.relations = []

        this.setValue = this._setValue.bind(this)
        this._success = this.__success.bind(this)
        this._error = this.__error.bind(this)
    }

    reset(): void {
        this.value = null
        this.reCalculate = false
    }

    createMeta(): EntityMeta {
        return new EntityMeta(this._originMeta)
    }

    getValue(): T {
        return this._cursor.get()
    }

    _setValue(value: T|Promise<T>): void {
        if (typeof value.then === 'function') {
            this._originMeta = this._originMeta.setPending()
            this._notify()
            value.then(this._success).catch(this._error)
        } else if (typeof value === 'object') {
            this._success(value)
        }
    }

    __success(value: T): void {
        this._cursor.set(value)
        this._originMeta = this._originMeta.success()
        this._notify()
    }

    __error(reason: Error): void {
        this._originMeta = this._originMeta.error(reason)
        this._notify()
    }
}
