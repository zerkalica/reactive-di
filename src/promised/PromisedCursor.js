/* @flow */

import EntityMeta from './EntityMeta'
import type {DepId} from '../interfaces'
import type {EntityMetaRec} from './EntityMeta'
import {AbstractPromisedCursor} from '../selectorInterfaces'
import Cursor from '../model/Cursor'

type MetaMap = {[id: DepId]: EntityMeta};
type NotifyFn = () => void;

export default class PromisedCursor extends AbstractPromisedCursor {
    _meta: MetaMap;
    _id: DepId;
    _parents: Array<DepId>;
    _id: DepId;
    _notify: NotifyFn;
    _cursor: Cursor;

    constructor(
        id: DepId,
        cursor: Cursor,
        parents: Array<DepId>,
        metaMap: MetaMap,
        notify: NotifyFn
    ) {
        super()
        this._meta = metaMap
        this._parents = parents
        this._id = id
        this._notify = notify
        this._cursor = cursor
    }

    _setMeta(rec: EntityMetaRec, needChange: boolean = true): void {
        const {_meta: meta, _id: id, _parents: parents} = this
        const oldMeta = meta[id]
        const newMeta = oldMeta.copy(rec)
        meta[id] = newMeta
        const isChanged = oldMeta !== newMeta
        if (isChanged) {
            const recs = [rec]
            for (let i = 0, l = parents.length; i < l; i++) {
                const parentId = parents[i]
                meta[parentId] = meta[parentId].combine(recs)
            }
            if (needChange) {
                this._notify()
            }
        }
    }

    get(): EntityMeta {
        return this._meta[this._id]
    }

    pending(): void {
        this._setMeta({
            pending: true,
            rejected: false,
            fulfilled: false,
            reason: null
        })
    }

    success<T>(value: T): void {
        this._setMeta({
            pending: false,
            rejected: false,
            fulfilled: true,
            reason: null
        }, !this._cursor.set(value))
    }

    error(reason: Error): void {
        this._setMeta({
            pending: false,
            rejected: true,
            fulfilled: false,
            reason
        })
    }
}
