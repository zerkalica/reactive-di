/* @flow */

import ServiceCursor from './ServiceCursor'
import type {DepId} from '../interfaces'
import {AbstractSelector} from '../selectorInterfaces'

export default class ServiceSelector {
    _selector: AbstractSelector;

    constructor(selector: AbstractSelector) {
        this._selector = selector
    }

    select(id: DepId): ServiceCursor {
        const cursor = this._selector.select(id)

        return new ServiceCursor(cursor)
    }
}
