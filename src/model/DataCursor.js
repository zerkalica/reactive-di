/* @flow */

import type {FromJS} from '../interfaces'
import {AbstractDataCursor} from '../interfaces'
import type {StateModel} from './interfaces'

function setInPath<V: Object, S: StateModel>(
    newModel: V,
    state: S,
    path: Array<string>,
    index: number
): StateModel {
    if (index === path.length) {
        return newModel
    }

    const rec = {}
    const prop: string = path[index];
    rec[prop] = setInPath(newModel, state[prop], path, index + 1)

    return state.copy(rec)
}

export default class DataCursor<V: StateModel> extends AbstractDataCursor<V> {
    _path: Array<string>;
    _stateRef: {state: StateModel};
    _selector: (v: StateModel) => any;

    fromJS: FromJS<V>;

    constructor(path: Array<string>, fromJS: FromJS<V>, stateRef: {state: StateModel}) {
        super()
        if (!Array.isArray(path)) {
            throw new Error('path is not an array')
        }
        this._path = path
        this.fromJS = fromJS;
        this._stateRef = stateRef
        try {
            /* eslint-disable no-new-func */
            this._selector = new Function('s', 'return ' + ['s'].concat(this._path).join('.'))
            /* eslint-enable no-new-func */
        } catch (e) {
            e.message = 'Can\'t create selector for path: ' + this._path.join('.') + ', ' + e.message
            throw e
        }
    }

    get(): V {
        return this._selector(this._stateRef.state)
    }

    set(newModel: V): boolean {
        const isChanged = newModel !== this.get()
        if (isChanged) {
            this._stateRef.state = setInPath(newModel, this._stateRef.state, this._path, 0)
        }
        return isChanged
    }
}
