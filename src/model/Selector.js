/* @flow */

import Cursor from './Cursor'
import PromisedCursor from '../promised/PromisedCursor'
import createDepMetaFromState, {StateDepsMeta} from './createDepMetaFromState'
import EntityMeta from '../promised/EntityMeta'
import type {DepId, IdsMap, NotifyDepFn} from '../interfaces'
import {Cursors, AbstractSelector} from '../selectorInterfaces'
/* eslint-disable no-unused-vars */
import type {StateModel, SetState, DepIdGetter} from './interfaces'
/* eslint-enable no-unused-vars */

type MetaMap = {[id: DepId]: EntityMeta};

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
    _metaMap: MetaMap;

    constructor(state: StateModel, getDepId: DepIdGetter) {
        super()
        this._stateRef = new StateRef(state)
        this._depMeta = createDepMetaFromState(state, getDepId)

        this._metaMap = {}
        Object.keys(this._depMeta.pathMap).forEach(id => {
            this._metaMap[id] = new EntityMeta()
        })
    }

    setNotify(notify: NotifyDepFn): AbstractSelector {
        this._notify = notify
        return this
    }

    getDepMap(): IdsMap {
        return this._depMeta.depMap
    }

    select<T: StateModel>(id: DepId): Cursors<T> {
        const {_notify, _depMeta} = this
        const {pathMap, fromJSMap, childMap} = _depMeta

        function notify(): void {
            _notify(id)
        }

        const data = new Cursor(pathMap[id], fromJSMap[id], this._stateRef, notify)
        const promised = new PromisedCursor(
            id,
            childMap[id],
            this._metaMap,
            notify
        )

        return new Cursors(data, promised)
    }
}
