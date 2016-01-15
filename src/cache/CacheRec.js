/* @flow */
import EntityMeta from './EntityMeta'
import type {DepId} from '../interfaces'
import {AbstractDataCursor} from '../interfaces'
import DepMeta from '../meta/DepMeta'
import Hooks from '../meta/Hooks'

type FromCacheRec<T> = (rec: CacheRec) => T;

export default class CacheRec<T: Object> {
    id: DepId;
    value: any;
    reCalculate: boolean;
    meta: EntityMeta;

    setAsyncValue: (value: any) => void;
    relations: Array<CacheRec>;
    deps: Array<CacheRec>;
    depMeta: DepMeta;
    link: CacheRec;

    _originMeta: EntityMeta;
    _success: (value: T) => void;
    _error: (reason: Error) => void;
    _cursor: AbstractDataCursor<T>;
    _hooks: Hooks;

    fromCacheRec: FromCacheRec;

    /* eslint-disable */
    constructor(rec: {
        id: DepId,
        hooks?: ?Hooks,
        fn: Function,
        tags: Array<string>,
        fromCacheRec: FromCacheRec
    }) {
        this.id = rec.id
        this.relations = rec.relations || []
        this.value = null
        this.reCalculate = true
        this.meta = new EntityMeta()
        this._originMeta = new EntityMeta()
        this._hooks = rec.hooks || new Hooks()
        this.deps = []
        this.fromCacheRec = rec.fromCacheRec

        this.setAsyncValue = this._setAsyncValue.bind(this)
        this._success = this.__success.bind(this)
        this._error = this.__error.bind(this)
    }

    getOriginMeta(): EntityMeta {
        return new EntityMeta(this._originMeta)
    }

    setValue(value: T): void {
        this.reCalculate = false
        this._hooks.onUpdate(this.value, value)
        this.value = value
    }

    onMount(): void {
        this._hooks.onMount(this.value)
    }

    onUnmount(): void {
        this._hooks.onUnmount(this.value)
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

    _setAsyncValue(value: T|Promise<T>): void {
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
