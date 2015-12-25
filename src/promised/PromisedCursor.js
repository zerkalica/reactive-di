/* @flow */

import EntityMeta from './EntityMeta'
import type {DepId} from '../interfaces'
import {AbstractCursor} from '../selectorInterfaces'
import type {EntityMetaRec} from './EntityMeta'

type MetaMap = {
    [id: DepId]: EntityMeta;
}
type NotifyFn = () => void;

export default class PromisedCursor<T> {
    _meta: MetaMap;
    _id: DepId;
    _childs: Array<DepId>;
    _id: DepId;
    _data: AbstractCursor;
    _notify: NotifyFn;

    constructor(data: AbstractCursor, childs: Array<DepId>, metaMap: MetaMap, id: DepId, notify: NotifyFn) {
        this._meta = metaMap
        this._childs = childs
        this._id = id
        this._data = data
        this._notify = notify
    }

    get(): EntityMeta {
        const {_meta, _id, _childs} = this
        return this._meta[_id].combine(_childs.map(id => _meta[id]))
    }

    _setMeta(rec: EntityMetaRec): void {
        const {_id} = this
        this._meta[_id] = this._meta[_id].copy(rec)
    }

    success(value: T): void {
        this._setMeta({
            pending: false,
            rejected: false,
            fulfilled: true,
            reason: null
        })
        this._data.set(value)
    }

    error(reason: Error): void {
        this._setMeta({
            pending: false,
            rejected: true,
            fulfilled: false,
            reason
        })
        this._notify()
    }

    pending(): void {
        this._setMeta({
            pending: true,
            rejected: false,
            fulfilled: false,
            reason: null
        })
        this._notify()
    }
}
