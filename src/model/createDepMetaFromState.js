/* @flow */

import type {FromJS, DepId} from '../interfaces'
import type {StateModelMeta, DepIdGetter} from './interfaces'

export class StateDepsMeta {
    depMap: {[id: DepId]: Array<DepId>};
    pathMap: {[id: DepId]: Array<string>};
    fromJSMap: {[id: DepId]: FromJS};

    constructor() {
        this.depMap = {}
        this.pathMap = {}
        this.fromJSMap = {}
    }
}

type PropCreatorMap = {[prop: string]: Function};
/* eslint-disable no-undef */
function createFromJS<T: Object>(Proto: Class<T>, propCreators: PropCreatorMap): FromJS<T> {
/* eslint-enable no-undef */
    return function fromJS<R: Object>(data: R): T {
        const keys = Object.keys(data)
        const props = {}
        for (let i = 0, l = keys.length; i < l; i++) {
            const key = keys[i]
            const value = data[key]
            props[key] = propCreators[key] ? propCreators[key](value) : value;
        }
        return new Proto(props)
    }
}

function getPathIds(
    obj: StateModelMeta,
    path: Array<string>,
    parents: Array<DepId>,
    meta: StateDepsMeta,
    getDepId: DepIdGetter,
): FromJS<StateModelMeta> {
    const {depMap, pathMap, fromJSMap} = meta
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
    const propCreators: PropCreatorMap = {};
    for (let i = 0, j = keys.length; i < j; i++) {
        const key: string = keys[i];
        const prop: StateModelMeta = obj[key];
        if (prop !== null && typeof prop === 'object' && prop.$meta) {
            propCreators[key] = getPathIds(prop, path.concat(key), parents, meta, getDepId)
        }
    }
    parents.pop()

    const fromJS = createFromJS(obj.constructor, propCreators)
    fromJSMap[id] = fromJS

    return fromJS
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
