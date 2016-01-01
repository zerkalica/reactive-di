/* @flow */

import DataCursor from './DataCursor'
import PromisedCursor from '../promised/PromisedCursor'
import createDepMetaFromState, {StateDepsMeta} from './createDepMetaFromState'
import type {DepId, IdsMap, NotifyDepFn} from '../interfaces'
import {AbstractSelector, AbstractCursor} from '../selectorInterfaces'
import Cursor from '../Cursor'
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
    _depMeta: StateDepsMeta;

    constructor(state: StateModel, getDepId: DepIdGetter) {
        super()
        this._stateRef = new StateRef(state)
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
        const {_stateRef: stateRef, _notify: notify, _depMeta: depMeta} = this
        const {pathMap, fromJSMap, parentMap, metaMap, childMap} = depMeta

        function notifyId(): void {
            notify(id)
        }

        const data = new DataCursor(pathMap[id], fromJSMap[id], stateRef, notifyId)
        const promised = new PromisedCursor(
            id,
            parentMap[id],
            childMap[id],
            metaMap,
            notifyId
        )

        return new Cursor(data, promised)
    }
}
