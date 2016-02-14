/* @flow */

/* eslint-disable no-unused-vars */
import type {Cursor} from '../../../interfaces/modelInterfaces'
/* eslint-enable no-unused-vars */
import merge from '../../../utils/merge'

function setInPath<V: Object, S: Object>(
    newModel: V,
    state: S,
    path: Array<string>,
    index: number
): S|V {
    if (index === path.length) {
        return newModel
    }

    const rec = {}
    const prop: string = path[index];
    rec[prop] = setInPath(newModel, state[prop], path, index + 1)

    return merge(state, rec)
}

type Selector<T: Object, P: Object> = (state: T) => P;

// implements Cursor
export default class PureDataCursor<S: Object, V: Object> {
    get: () => V;
    set: (newModel: V) => boolean;

    constructor(path: Array<string>, stateRef: {state: S}) {
        /* eslint-disable no-new-func */
        const selector: Selector<S, V> =
            ((new Function('s', 'return ' + ['s'].concat(path).join('.'))): Function);
        /* eslint-enable no-new-func */
        this.get = function get(): V {
            return selector(stateRef.state)
        }
        this.set = function set(newModel: V): boolean {
            const state = stateRef.state
            const isChanged = newModel !== selector(state)
            if (isChanged) {
                /* eslint-disable no-param-reassign */
                stateRef.state = ((setInPath(newModel, state, path, 0): any): S)
            }

            return isChanged
        }
    }
}
