/* @flow */

import createDepMetaFromState from './createDepMetaFromState'
import Cursor from './Cursor'
import DepMeta from '../meta/DepMeta'
import type {DepId, IdsMap, NotifyDepFn} from '../interfaces'
/* eslint-disable no-unused-vars */
import type {StateModel, DepIdGetter} from './interfaces'
/* eslint-enable no-unused-vars */
import {AbstractSelector, AbstractCursor} from '../selectorInterfaces'

type PathMap = {[id: DepId]: Array<string>};

function defaultGetDepId(obj: Object): DepId {
    return DepMeta.get(obj.constructor).id
}

export default class Selector<S: StateModel> extends AbstractSelector {
    _state: S;
    _pathMap: PathMap;
    _getDepId: DepIdGetter;

    constructor(state: S, getDepId: ?DepIdGetter) {
        super()
        this._state = state
        this._pathMap = {}
        this._getDepId = getDepId || defaultGetDepId
    }

    getDepMap(notify: NotifyDepFn): IdsMap {
        const depsMeta = createDepMetaFromState(this._state, notify, this._getDepId)
        this._pathMap = depsMeta.pathMap

        return depsMeta.depMap
    }

    select<T: StateModel>(id: DepId): AbstractCursor<T> {
        if (!this._pathMap) {
            throw new Error('Call selector.getDepMap first')
        }
        return new Cursor(this._pathMap[id], this._state)
    }
}
