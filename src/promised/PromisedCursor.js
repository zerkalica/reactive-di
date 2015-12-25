/* @flow */

import EntityMeta from './EntityMeta'
import type {DepId} from '../interfaces'
import type {EntityMetaRec} from './EntityMeta'
import {AbstractPromisedCursor} from '../selectorInterfaces'

type MetaMap = {[id: DepId]: EntityMeta};
type NotifyFn = () => void;

export default class PromisedCursor extends AbstractPromisedCursor {
    _meta: MetaMap;
    _id: DepId;
    _parents: Array<DepId>;
    _id: DepId;
    _notify: NotifyFn;

    constructor(
        id: DepId,
        parents: Array<DepId>,
        metaMap: MetaMap,
        notify: NotifyFn
    ) {
        super()
        this._meta = metaMap
        this._parents = parents
        this._id = id
        this._notify = notify
    }

    _setMeta(rec: EntityMetaRec): void {
        const {_meta, _id, _parents} = this
        const oldMeta = _meta[_id]
        const newMeta = oldMeta.copy(rec)
        _meta[_id] = newMeta
        if (oldMeta !== newMeta) {
            for (let i = 0, l = _parents.length; i < l; i++) {
                const parentId = _parents[i]
                _meta[parentId] = _meta[parentId].copy(rec)
            }
            this._notify()
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

    success(): void {
        this._setMeta({
            pending: false,
            rejected: false,
            fulfilled: true,
            reason: null
        })
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
