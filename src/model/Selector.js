/* @flow */

import DataCursor from './DataCursor'
import createDepMetaFromState from './createDepMetaFromState'
import type {DepId, NotifyDepFn} from '../interfaces'
import {AbstractSelector, AbstractDataCursor, DepNode, StateNode} from '../selectorInterfaces'
/* eslint-disable no-unused-vars */
import type {StateModel, SetState, DepIdGetter} from './interfaces'
/* eslint-enable no-unused-vars */

class StateRef<T: Object> {
    state: T;

    constructor(state: T) {
        this.state = state
    }
}

export default class Selector extends AbstractSelector {
    _stateRef: StateRef;
    _notify: NotifyDepFn;
    _stateNodeMap: {[id: DepId]: StateNode};

    depNodeMap: {[id: DepId]: DepNode};

    constructor(state: StateModel, getDepId: DepIdGetter) {
        super()
        const {depNodeMap, stateNodeMap} = createDepMetaFromState(state, getDepId)
        this._stateNodeMap = stateNodeMap
        this.depNodeMap = depNodeMap
        this._stateRef = new StateRef(state)
    }

    setNotify(notify: NotifyDepFn): AbstractSelector {
        this._notify = notify
        return this
    }

    select<T: StateModel>(id: DepId): AbstractDataCursor<T> {
        const {_stateRef: stateRef, _notify: notify, _stateNodeMap: stateNodeMap} = this
        const {path, fromJS} = stateNodeMap[id]

        function notifyId(): void {
            notify(id)
        }

        return new DataCursor(path, fromJS, stateRef, notifyId)
    }
}
