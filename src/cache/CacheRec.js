/* @flow */
import EntityMeta from '../meta/EntityMeta'
import type {DepId} from '../interfaces'
import {AbstractDataCursor} from '../interfaces'

export default class CacheRec<T: Object> {
    id: DepId;
    value: any;
    reCalculate: boolean;
    meta: EntityMeta;

    setValue: (value: any) => void;
    relations: Array<CacheRec>;

    _originMeta: EntityMeta;
    _success: (value: T) => void;
    _error: (reason: Error) => void;
    _cursor: AbstractDataCursor<T>;

    constructor(id: DepId, relations?: Array<CacheRec>) {
        this.id = id
        this.value = null
        this.reCalculate = true
        this.meta = new EntityMeta()
        this._originMeta = new EntityMeta()
        this.relations = relations || []

        this.setValue = this._setValue.bind(this)
        this._success = this.__success.bind(this)
        this._error = this.__error.bind(this)
    }

    reset(): void {
        this.reCalculate = false
    }

    createMeta(): EntityMeta {
        return new EntityMeta(this._originMeta)
    }

    getValue(): T {
        return this._cursor.get()
    }

    setCursor(cursor: AbstractDataCursor<T>): void {
        this._cursor = cursor
    }

    _notify(): void {
        this.reCalculate = true
        const relations = this.relations
        for (let i = 0, l = relations.length; i < l; i++) {
            relations[i].reCalculate = true
        }
    }

    _setValue(value: T|Promise<T>): void {
        if (typeof value.then === 'function') {
            const newMeta = this._originMeta.setPending()
            if (this._originMeta === newMeta) {
                // if previous value is pending - do not handle this value: only first
                return
            }
            this._notify()
            this._originMeta = newMeta
            value.then(this._success).catch(this._error)
        } else if (typeof value === 'object') {
            this._success(value)
        }
    }

    __success(value: T): void {
        const isDataChanged = this._cursor.set(value)
        const newMeta = this._originMeta.success()
        if (newMeta !== this._originMeta || isDataChanged) {
            this._notify()
        }
        this._originMeta = newMeta
    }

    __error(reason: Error): void {
        const newMeta = this._originMeta.error(reason)
        if (newMeta !== this._originMeta) {
            this._notify()
        }
        this._originMeta = newMeta
    }
}

export type CacheRecMap = {[id: DepId]: CacheRec};
