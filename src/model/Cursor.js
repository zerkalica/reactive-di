/* @flow */
import type {StateModel, SetState} from './interfaces'
import {AbstractCursor} from '../selectorInterfaces'

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

export default class Cursor<V: StateModel> extends AbstractCursor<V> {
    _path: Array<string>;
    _state: StateModel;
    _selector: (v: StateModel) => any;
    _setState: SetState<V>;

    constructor(path: Array<string>, state: StateModel, setState: SetState<V>) {
        super()
        this._state = state
        this._setState = setState
        this._path = path
        /* eslint-disable no-new-func */
        this._selector = new Function('s', 'return ' + ['s'].concat(this._path).join('.'))
        /* eslint-enable no-new-func */
    }

    get(): V {
        return this._selector(this._state)
    }

    set(newModel: V): void {
        this._state = setInPath(newModel, this._state, this._path, 0)
        this._setState(this._state)
    }
}
