/* @flow */

import type {DepId} from '../interfaces'
import type {StateModelMeta, DepIdGetter} from './interfaces'

export class StateDepsMeta {
    depMap: {[id: DepId]: Array<DepId>};
    pathMap: {[id: DepId]: Array<string>};

    constructor() {
        this.depMap = {}
        this.pathMap = {}
    }
}

function getPathIds(
    obj: StateModelMeta,
    path: Array<string>,
    parents: Array<DepId>,
    meta: StateDepsMeta,
    getDepId: DepIdGetter
): void {
    const {depMap, pathMap} = meta
    const id = getDepId(obj)

    pathMap[id] = path
    // write all parents and self to affect ids map
    depMap[id] = parents.concat([id])
    // write self to all parents affect ids map
    // parents knowns about childs
    for (let k = 0, l = parents.length; k < l; k++) {
        depMap[parents[k]].push(id)
    }

    parents.push(id)
    const keys: Array<string> = Object.keys(obj);
    for (let i = 0, j = keys.length; i < j; i++) {
        const key: string = keys[i];
        const prop: StateModelMeta = obj[key];
        if (prop !== null && typeof prop === 'object' && prop.$meta) {
            getPathIds(prop, path.concat(key), parents, meta, getDepId)
        }
    }
    parents.pop()
}

export default function createDepMetaFromState(
    obj: StateModelMeta,
    getDepId: DepIdGetter
): StateDepsMeta {
    if (obj === null || typeof obj !== 'object') {
        throw new TypeError('Not an object: ' + String(obj))
    }

    const stateDepsMeta = new StateDepsMeta()
    getPathIds(obj, [], [], stateDepsMeta, getDepId)

    return stateDepsMeta
}
