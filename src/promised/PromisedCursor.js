/* @flow */

import EntityMeta from './EntityMeta'
import type {DepId} from '../interfaces'
import type {EntityMetaRec} from './EntityMeta'
import {AbstractPromisedCursor} from '../selectorInterfaces'
type MetaMap = {[id: DepId]: EntityMeta};
type NotifyFn = () => void;

export default class PromisedCursor extends AbstractPromisedCursor {
    _cachedMeta: {[id: DepId]: ?EntityMeta};
    _meta: EntityMeta;
    _childs: Array<PromisedCursor>;
    _parents: Array<DepId>;
    _id: DepId;
    _notify: NotifyFn;

    constructor(
        parents: Array<DepId>,
        childs: Array<PromisedCursor>,
        notify: NotifyFn,
        cachedMeta: {[id: DepId]: ?EntityMeta}
    ) {
        super()
        this._cachedMeta = cachedMeta
        this._meta = new EntityMeta()
        this._parents = parents
        this._childs = childs
        this._notify = notify
    }

    _setMeta(rec: EntityMetaRec): void {
        const {_meta: meta} = this
        const newMeta: EntityMeta = meta.copy(rec);
        const isChanged = meta !== newMeta
        if (isChanged) {
            this._cachedMeta = null
            this._meta = newMeta
            this._notify()
        }
    }

    get(): EntityMeta {
        let result = this._cachedMeta
        if (!result) {
            result = this._meta
            for (let i = 0, l = childs.length; i < l; i++) {
                result = result.combine([childs[i].get()])
            }
            this._cachedMeta = result
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
