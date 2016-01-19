/* @flow */

/* eslint-disable no-unused-vars */
import type {Cursor} from '../nodes/nodeInterfaces'
/* eslint-enable no-unused-vars */

function setInPath<V: Object, S: Object>(
    newModel: V,
    state: S,
    path: Array<string>,
    index: number
): S {
    if (index === path.length) {
        return ((newModel: any): S)
    }

    const rec = {}
    const prop: string = path[index];
    rec[prop] = setInPath(newModel, state[prop], path, index + 1)

    return state.copy(rec)
}

// implements Cursor
export default class PureDataCursor<S: Object, V: Object> {
    get: () => V;
    set: (newModel: V) => boolean;

    constructor(path: Array<string>, stateRef: {state: S}) {
        /* eslint-disable no-new-func */
        const selector: Function = new Function('s', 'return ' + ['s'].concat(path).join('.'));
        /* eslint-enable no-new-func */
        this.get = function get(): V {
            return selector(stateRef.state)
        }
        this.set = function set(newModel: V): boolean {
            const state = stateRef.state
            const isChanged = newModel !== selector(state)
            if (isChanged) {
                /* eslint-disable no-param-reassign */
                stateRef.state = setInPath(newModel, state, path, 0)
            }

            return isChanged
        }
    }
}
