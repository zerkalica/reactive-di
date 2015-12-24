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

function SetEntityMeta(childMetas: Array<EntityMeta>) {
    return function setEntityMeta(rec: EntityMetaRec): EntityMeta {
        return cursor.set(new EntityMeta(childMetas.concat(rec)))
    }
}
setter(meta(User))(SetEntityMeta)

export default class Selector extends AbstractSelector {
    _state: StateModel;
    _notify: NotifyDepFn;
    _depMeta: StateDepsMeta;

    constructor(state: StateModel, getDepId: DepIdGetter) {
        super()
        this._state = new State(state)
        this._depMeta = createDepMetaFromState(this._state, getDepId)
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

        return new Cursor(pathMap[id], fromJSMap[id], this._state, newState => {
            this._state = newState
            this._notify(id)
        })
    }
}
