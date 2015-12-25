/* @flow */

import Cursor from './Cursor'
import createDepMetaFromState, {StateDepsMeta} from './createDepMetaFromState'
import EntityMeta from '../promised/EntityMeta'
import type {EntityMetaRec} from '../promised/EntityMeta'
import type {DepId, IdsMap, NotifyDepFn} from '../interfaces'
import {AbstractSelector, AbstractCursor} from '../selectorInterfaces'
/* eslint-disable no-unused-vars */
import type {StateModel, SetState, DepIdGetter} from './interfaces'
/* eslint-enable no-unused-vars */

class State<T: Object> {
    state: T;
    meta: {[id: DepId]: EntityMeta};

    constructor(state: T) {
        this.state = state
        this.meta = {}
    }
}

export default class Selector extends AbstractSelector {
    _stateRef: {state: StateModel};
    _notify: NotifyDepFn;
    _depMeta: StateDepsMeta;

    constructor(rawState: StateModel, getDepId: DepIdGetter) {
        super()
        const state = new State(rawState)
        this._stateRef = {state}
        this._depMeta = createDepMetaFromState(state, getDepId)
    }

    setNotify(notify: NotifyDepFn): AbstractSelector {
        this._notify = notify
        return this
    }

    getDepMap(): IdsMap {
        return this._depMeta.depMap
    }

    select<T: StateModel>(id: DepId): AbstractCursor<T> {
        const {_notify, _depMeta} = this
        const {pathMap, fromJSMap} = _depMeta

        function notify(): void {
            _notify(id)
        }

        return new Cursor(pathMap[id], fromJSMap[id], this._stateRef, notify)
    }
}
