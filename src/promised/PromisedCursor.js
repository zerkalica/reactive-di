/* @flow */

import EntityMeta from './EntityMeta'
import type {GetEntityMeta} from './EntityMeta'
import type {DepId} from '../interfaces'
import type {EntityMetaRec} from './EntityMeta'
import {AbstractPromisedCursor} from '../selectorInterfaces'

type MetaMap = {[id: DepId]: EntityMeta};
type NotifyFn = () => void;

export default class PromisedCursor extends AbstractPromisedCursor {
    _meta: MetaMap;
    _id: DepId;
    _childs: Array<DepId>;
    _id: DepId;
    _notify: NotifyFn;
    _getEntityMeta: GetEntityMeta;

    constructor(
        id: DepId,
        childs: Array<DepId>,
        metaMap: MetaMap,
        notify: NotifyFn
    ) {
        super()
        this._meta = metaMap
        this._childs = childs
        this._id = id
        this._notify = notify

        function getEntityMeta(childId: DepId): EntityMeta {
            return metaMap[childId]
        }

        this._getEntityMeta = getEntityMeta
    }

    _setMeta(rec: EntityMetaRec): void {
        const {_meta, _id} = this
        const oldMeta = _meta[_id]
        const newMeta = oldMeta.copy(rec)
        _meta[_id] = newMeta
        if (oldMeta !== newMeta) {
            this._notify()
        }
    }

    get(): EntityMeta {
        const {_meta, _id, _childs, _getEntityMeta} = this
        const newMeta = _meta[_id]
            .combine(_childs.map(_getEntityMeta))
        _meta[_id] = newMeta
        return newMeta
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
