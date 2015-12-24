/* @flow */

import Cursor from './Cursor'
import createDepMetaFromState, {StateDepsMeta} from './createDepMetaFromState'
import type {FromJS, DepId, IdsMap, NotifyDepFn} from '../interfaces'
import {AbstractSelector, AbstractCursor} from '../selectorInterfaces'
/* eslint-disable no-unused-vars */
import type {StateModel, SetState, DepIdGetter} from './interfaces'
/* eslint-enable no-unused-vars */
import EntityMeta from '../promised/EntityMeta'

function noop() {
}

export default class Selector extends AbstractSelector {
    _state: StateModel;
    _notify: NotifyDepFn;

    _depMeta: StateDepsMeta;

    _promisedMap: {[id: DepId]: EntityMeta};

    constructor(state: StateModel, getDepId: DepIdGetter) {
        super()
        this._state = state
        this._notify = noop

        this._depMeta = createDepMetaFromState(this._state, getDepId)
        this._promisedMap = {}
        Object.keys(this._depMeta.depMap).forEach(depId => {
            this._promisedMap[depId] = new EntityMeta()
        })
    }

    setNotify(notify: NotifyDepFn): AbstractSelector {
        this._notify = notify
        return this
    }

    getDepMap(): IdsMap {
        return this._depMeta.depMap
    }

    select<T: StateModel>(id: DepId): AbstractCursor<T> {
        const {pathMap, fromJSMap} = this._depMeta
        const fromJS: FromJS = fromJSMap[id];
        const setState = newState => {
            this._state = newState
            this._notify(id)
        };

        return new Cursor(pathMap[id], fromJS, this._state, setState)
    }
}
