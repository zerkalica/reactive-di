/* @flow */

/* eslint-disable no-unused-vars */
import Promised from './Promised'
/* eslint-enable no-unused-vars */
import ServiceCursor from './ServiceCursor'
import type {DepId, NotifyDepFn, IdsMap} from '../interfaces'
import {AbstractSelector, AbstractCursor} from '../selectorInterfaces'

export default class ServiceSelector extends AbstractSelector {
    _selector: AbstractSelector;
    _notify: NotifyDepFn;

    constructor(selector: AbstractSelector, notify: NotifyDepFn) {
        super()
        this._notify = notify
        this._selector = selector
    }

    getDepMap(): IdsMap {
        return this._selector.getDepMap()
    }

    setNotify(): AbstractSelector {
        this._selector.setNotify(notify)
        this._notify = notify
        return this
    }

    select<T: Promised>(id: DepId): AbstractCursor<T> {
        const cursor = this._selector.select(id)
        const childsMeta = this._childMap[id].map(id => this._metaMap[id])

        function setMeta(rec: EntityMetaRec) {
            this._metaMap[id] = meta.combine(childsMeta)
        }

        function set(value): void {
            this._cursor.set(value)
        }

        function notify() {
            this._notify(id)
        }

        return new ServiceCursor(setMeta, set, notify)
    }
}
