/* @flow */

import DataCursor from './DataCursor'
import StateMapBuilder from './StateMapBuilder'
import type {CacheRecMap} from '../CacheRec'
import type {FromJS} from '../interfaces'
import type {StateModel, DepIdGetter} from './interfaces'

export default function createStateMap(state: StateModel, getDepId: DepIdGetter): CacheRecMap {
    const stateRef = {state}
    function select(path: Array<string>, fromJS: FromJS) {
        return new DataCursor(path, fromJS, stateRef)
    }

    const stateMapBuilder = new StateMapBuilder(select, state, getDepId)

    return stateMapBuilder.build()
}
