/* @flow */

import createDepMetaFromState, {StateDepsMeta} from './createDepMetaFromState'
import Cursor from './Cursor'
import DepMeta from '../meta/DepMeta'
import type {DepId, IdsMap, NotifyDepFn} from '../interfaces'
/* eslint-disable no-unused-vars */
import type {StateModel, SetState, DepIdGetter} from './interfaces'
/* eslint-enable no-unused-vars */
import {AbstractSelector, AbstractCursor} from '../selectorInterfaces'

function defaultGetDepId(obj: Object): DepId {
    return DepMeta.get(obj.constructor).id
}

function noop() {
}

export default class Selector extends AbstractSelector {
    _state: StateModel;
    _getDepId: DepIdGetter;
    _notify: NotifyDepFn;

    _depMeta: StateDepsMeta;

    constructor(state: StateModel, getDepId?: DepIdGetter) {
        super()
        this._state = state
        this._getDepId = getDepId || defaultGetDepId
        this._notify = noop
        this._depMeta = createDepMetaFromState(this._state, this._getDepId)
    }

    setNotify(notify: NotifyDepFn): AbstractSelector {
        this._notify = notify
        return this
    }

    getDepMap(): IdsMap {
        return this._depMeta.depMap
    }

    select<T: StateModel>(id: DepId): AbstractCursor<T> {
        const setState = newState => {
            this._state = newState
            this._notify(id)
        };

        return new Cursor(this._depMeta.pathMap[id], this._state, setState)
    }
}
