/* @flow */

import type {FromJS, DepId} from '../interfaces'
import type {StateModelMeta, DepIdGetter} from './interfaces'
import {DepNode, StateNode} from '../selectorInterfaces'

export class StateDepsMeta {
    stateNodeMap: {[id: DepId]: StateNode};
    depNodeMap: {[id: DepId]: DepNode};

    constructor() {
        this.stateNodeMap = Object.create(null)
        this.depNodeMap = Object.create(null)
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
    getDepId: DepIdGetter
): FromJS<StateModelMeta> {
    const {stateNodeMap, depNodeMap} = meta
    const id = getDepId(obj)

    // write self to all parents affect ids map
    // parents knowns about childs

    const l = parents.length - 1
    const parentId = l >= 0 ? parents[l] : null
    for (let k = 0; k <= l; k++) {
        depNodeMap[parents[k]].relations.push(id)
    }
    depNodeMap[id] = new DepNode(parents.concat([]), parents.concat([id]))
    if (parentId) {
        depNodeMap[parentId].childs.push(id)
    }

    parents.push(id)
    const keys: Array<string> = Object.keys(obj);
    const propCreators: PropCreatorMap = {};
    for (let i = 0, j = keys.length; i < j; i++) {
        const key: string = keys[i];
        const prop: StateModelMeta = obj[key];
        if (prop !== null && typeof prop === 'object' && getDepId(prop)) {
            propCreators[key] = getPathIds(prop, path.concat(key), parents, meta, getDepId)
        }
    }
    parents.pop()

    const fromJS = createFromJS(obj.constructor, propCreators)
    stateNodeMap[id] = new StateNode(path, fromJS)

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
