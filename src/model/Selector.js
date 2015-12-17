/* @flow */

import createDepMetaFromState from './createDepMetaFromState'
import Cursor from './Cursor'
import DepMeta from '../meta/DepMeta'
import type {DepId, Dependency, IdsMap, NotifyDepFn} from '../interfaces'
import type {StateModel} from './interfaces'
import {AbstractSelector, AbstractCursor} from '../selectorInterfaces'

type PathMap = {[id: DepId]: Array<string>};

export default class Selector<S: StateModel> extends AbstractSelector {
    _state: S;
    _pathMap: PathMap;

    depMap: IdsMap;

    constructor(state: S) {
        super()
        this._state = state
        this._pathMap = {}
    }

    getDepMap(notify: NotifyDepFn): IdsMap {
        const depsMeta = createDepMetaFromState(this._state, notify)
        this._pathMap = depsMeta.pathMap

        return depsMeta.depMap
    }

    select<T: StateModel>(cls: Dependency<T>): AbstractCursor<T> {
        if (!this._pathMap) {
            throw new Error('Call selector.getDepMap first')
        }
        const {id}: DepMeta = DepMeta.get(cls);
        return new Cursor(this._pathMap[id], this._state)
    }
}
