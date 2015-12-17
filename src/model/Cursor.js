/* @flow */
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

export default class Cursor<V: StateModel> {
    _path: Array<string>;
    _state: StateModel;
    _selector: (v: StateModel) => any;

    constructor(path: Array<string>, state: StateModel) {
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
    }
}
