/* @flow */
import type {ImmutableStateModel} from './interfaces'
import {AbstractCursor} from '../selectorInterfaces'

function setInPath<V: Object, S: ImmutableStateModel>(
    newModel: V,
    state: S,
    path: Array<string>,
    index: number
): ImmutableStateModel {
    if (index === path.length) {
        return newModel
    }

    const rec = {}
    const prop: string = path[index];
    rec[prop] = setInPath(newModel, state[prop], path, index + 1)

    return state.copy(rec)
}

export default class Cursor<V: ImmutableStateModel> extends AbstractCursor<V> {
    _path: Array<string>;
    _state: ImmutableStateModel;
    _selector: (v: ImmutableStateModel) => any;

    constructor(path: Array<string>, state: ImmutableStateModel) {
        super()
        this._state = state
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
