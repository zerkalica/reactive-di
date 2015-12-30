/* @flow */

import EntityMeta from './EntityMeta'
import type {DepId} from '../interfaces'
import type {EntityMetaRec} from './EntityMeta'
import {AbstractPromisedCursor} from '../selectorInterfaces'
type MetaMap = {[id: DepId]: EntityMeta};
type NotifyFn = () => void;

export default class PromisedCursor extends AbstractPromisedCursor {
    _cachedMeta: {[id: DepId]: ?EntityMeta};
    _selfMeta: MetaMap;
    _childs: Array<PromisedCursor>;
    id: DepId;
    _parents: Array<DepId>;
    _id: DepId;
    _notify: NotifyFn;

    constructor(
        id: DepId,
        parents: Array<DepId>,
        childs: Array<PromisedCursor>,
        metaMap: MetaMap,
        notify: NotifyFn,
        cachedMeta: {[id: DepId]: ?EntityMeta}
    ) {
        super()
        this._cachedMeta = cachedMeta
        this._selfMeta = metaMap
        this._parents = parents
        this._childs = childs
        this.id = id
        this._notify = notify
    }

    _setMeta(rec: EntityMetaRec, needNotify: boolean = true): void {
        const {_cachedMeta: cachedMeta, _selfMeta: selfMeta, id, _parents: parents} = this
        const oldMeta: EntityMeta = selfMeta[id];
        const newMeta: EntityMeta = oldMeta.copy(rec);
        const isChanged = oldMeta !== newMeta
        if (isChanged) {
            selfMeta[id] = newMeta
            cachedMeta[id] = null
            for (let i = 0, l = parents.length; i < l; i++) {
                cachedMeta[parents[i]] = null
            }
            if (needNotify) {
                this._notify()
            }
        }
    }

    get(): EntityMeta {
        const {_cachedMeta: cachedMeta, _selfMeta: selfMeta, _childs: childs, id} = this
        let result = cachedMeta[id]
        if (!result) {
            result = selfMeta[id]
            for (let i = 0, l = childs.length; i < l; i++) {
                result = result.combine([childs[i].get()])
            }
            cachedMeta[id] = result
        }
        return result
    }

    pending(): void {
        this._setMeta({
            pending: true,
            rejected: false,
            fulfilled: false,
            reason: null
        })
    }

    success(needNotify: boolean = false): void {
        this._setMeta({
            pending: false,
            rejected: false,
            fulfilled: true,
            reason: null
        }, needNotify)
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
