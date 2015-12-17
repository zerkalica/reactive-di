/* @flow */

import DepMeta from '../DepMeta'
import type {Dependency, NotifyDepFn, DepId} from '../interfaces'
import type {StateModel} from './interfaces'

export class StateDepsMeta {
    depMap: {[id: DepId]: Array<DepId>};
    pathMap: {[id: DepId]: Array<string>};

    constructor() {
        this.depMap = {}
        this.pathMap = {}
    }
}

function getPathIds(
    obj: StateModel,
    path: Array<string>,
    parents: Array<DepId>,
    meta: StateDepsMeta,
    notify: NotifyDepFn
): void {
    const {depMap, pathMap} = meta
    const modelMeta = DepMeta.get(obj.constructor)
    const {id} = modelMeta

    pathMap[id] = path
    obj.$meta.notify = function _notify() {
        notify(id)
    }
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
        const prop: StateModel = obj[key];
        if (prop !== null && typeof prop === 'object') {
            getPathIds(prop, path.concat(key), parents, meta, notify)
        }
    }
    parents.pop()
}

export default function createDepMetaFromState(
    obj: StateModel,
    notify: NotifyDepFn
): StateDepsMeta {
    if (obj === null || typeof obj !== 'object') {
        throw new TypeError('Not an object: ' + String(obj))
    }

    const stateDepsMeta = new StateDepsMeta()
    getPathIds(obj, [], [], stateDepsMeta, notify)

    return stateDepsMeta
}
