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

    constructor(selector: AbstractSelector) {
        super()
        this._selector = selector
    }

    getDepMap(): IdsMap {
        return this._selector.getDepMap()
    }

    setNotify(notify: NotifyDepFn): AbstractSelector {
        this._selector.setNotify(notify)
        this._notify = notify
        return this
    }

    select<T: Promised>(id: DepId): AbstractCursor<T> {
        const cursor = this._selector.select(id)

        return new ServiceCursor(cursor, () => this._notify(id))
    }
}
