/* @flow */

import EntityMeta, {updateMeta} from './EntityMeta'
import type {EntityMetaRec} from './EntityMeta'
import {AbstractPromisedCursor} from '../selectorInterfaces'
type NotifyFn = () => void;

export default class PromisedCursor extends AbstractPromisedCursor {
    _cachedMeta: ?EntityMeta;
    _meta: EntityMeta;
    _childs: Array<PromisedCursor>;
    _parent: ?PromisedCursor;
    _notify: NotifyFn;

    constructor(
        childs: Array<PromisedCursor>,
        parents: ?PromisedCursor,
        notify: NotifyFn
    ) {
        super()
        this._cachedMeta = null
        this._meta = new EntityMeta()
        this._childs = childs
        this._parent = parent
        this._notify = notify
    }

    _setMeta(rec: EntityMetaRec, needNotify: boolean = true): void {
        const newMeta: EntityMeta = this._meta.copy(rec);
        const isChanged = this._meta !== newMeta
        if (isChanged) {
            this.clear()
            this._meta = newMeta
            if (needNotify) {
                this._notify()
            }
        }
    }

    clear(): void {
        if (this._parent) {
            this._parent.clear()
        }
        this._cachedMeta = null
    }

    get(): EntityMeta {
        const {_meta: meta, _childs: childs} = this
        let result = this._cachedMeta
        if (!result) {
            result = meta.copy()
            let isChanged: boolean = false;
            for (let i = 0, l = childs.length; i < l; i++) {
                if (updateMeta(result, childs[i].get())) {
                    isChanged = true
                }
            }
            this._cachedMeta = isChanged ? result : meta
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

    success(needNotify: boolean = true): void {
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
