/* @flow */

import type {FromJS} from '../interfaces'
import type {StateModelMeta, DepIdGetter, CreateCursor} from './interfaces'
import CacheRec from '../cache/CacheRec'
import type {CacheRecMap} from '../cache/CacheRec'

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

export default class StateMapBuilder {
    _select: CreateCursor;
    _state: StateModelMeta;
    _cache: CacheRecMap;
    _getDepId: DepIdGetter;

    constructor(select: CreateCursor, state: StateModelMeta, getDepId: DepIdGetter) {
        this._select = select
        this._state = state
        this._cache = Object.create(null)
        this._getDepId = getDepId
    }

    build(): CacheRecMap {
        this._build(this._state, [], [])
        return this._cache
    }

    _build(obj: StateModelMeta, parents: Array<CacheRec>, path: Array<string>): FromJS<StateModelMeta> {
        const {_getDepId: getDepId, _cache: cache, _select: select} = this
        const id = getDepId(obj)
        // write self to all parents affect ids map
        // parents knowns about childs
        const cacheRec = new CacheRec(id, [].concat(parents))
        cache[id] = cacheRec
        for (let k = 0, l = parents.length; k < l; k++) {
            parents[k].relations.push(cacheRec)
        }

        parents.push(cacheRec)
        const keys: Array<string> = Object.keys(obj);
        const propCreators: PropCreatorMap = {};
        for (let i = 0, j = keys.length; i < j; i++) {
            const key: string = keys[i];
            const prop: StateModelMeta = obj[key];
            if (prop !== null && typeof prop === 'object' && getDepId(prop)) {
                propCreators[key] = this._build(prop, parents, path.concat(key))
            }
        }
        parents.pop()

        const fromJS = createFromJS(obj.constructor, propCreators)
        const cursor = select(path, fromJS)
        cacheRec.setCursor(cursor)
        cacheRec.value = cursor.get()

        return fromJS
    }
}
