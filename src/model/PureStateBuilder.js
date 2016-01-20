/* @flow */

import createId from '../utils/createId'
import PureDataCursor from './PureDataCursor'
import type {
    DepId,
    AnnotationDriver,
    ModelAnnotation
} from '../annotations/annotationInterfaces'
import {ModelDepImpl} from '../nodes/nodeImpl'
import type {
    FromJS,
    ModelDep,
    Notifier
} from '../nodes/nodeInterfaces'

type PropCreator<V: Object, N: Object> = (value: V) => N;
type PropCreatorMap = {[prop: string]: PropCreator};

/* eslint-disable no-undef */
function createFromJS<T: Object>(Proto: Class<T>, propCreators: PropCreatorMap): FromJS<T> {
/* eslint-enable no-undef */
    return function fromJS<R: Object>(data: R): T {
        const keys = Object.keys(data)
        const props = {}
        for (let i = 0, l = keys.length; i < l; i++) {
            const key = keys[i]
            const value = data[key]
            const createProp: ?Function = propCreators[key]
            props[key] = createProp ? createProp(value) : value;
        }
        return new Proto(props)
    }
}

type StateMap = {[id: DepId]: ModelDep};
export default class StateMapBuilder<State: Object> {
    _driver: AnnotationDriver;
    _stateMap: StateMap;
    _stateRef: {state: State};
    _notifier: Notifier;

    constructor(driver: AnnotationDriver, notifier: Notifier, state: State) {
        this._driver = driver
        this._stateRef = {state}
        this._stateMap = Object.create(null)
        this._notifier = notifier
    }

    build(): StateMap {
        this._build(this._stateRef, [], [])
        return this._stateMap
    }

    _getAnnotation<T: Object, C: Class<T>>(dep: T): ModelAnnotation {
        return this._driver.get((dep.constructor: C))
    }

    _build<T: Object>(obj: T, parents: Array<ModelDep>, path: Array<string>): FromJS<T> {
        const annotation: ModelAnnotation = this._getAnnotation(obj);
        if (!annotation.id) {
            annotation.id = createId()
        }

        const cursor = new PureDataCursor(path, this._stateRef)
        const modelDep: ModelDep = new ModelDepImpl(
            annotation.id,
            annotation.info,
            this._notifier,
            cursor,
            [].concat(parents)
        );

        this._stateMap[annotation.id] = modelDep
        // write self to all parents affect ids map
        for (let k = 0, l = parents.length; k < l; k++) {
            const parent = parents[k]
            parent.relations.push(modelDep)
            parent.childs.push(modelDep)
        }

        parents.push(modelDep)
        const keys: Array<string> = Object.keys(obj);
        const propCreators: PropCreatorMap = {};
        for (let i = 0, j = keys.length; i < j; i++) {
            const key: string = keys[i];
            const prop: any = obj[key];
            if (prop !== null && typeof prop === 'object') {
                propCreators[key] = this._build(prop, parents, path.concat(key))
            }
        }
        parents.pop()

        const fromJS: FromJS<T> = createFromJS(obj.constructor, propCreators);
        modelDep.fromJS = fromJS
        const cache = modelDep.cache
        cache.isRecalculate = false
        cache.value = obj

        return fromJS
    }
}
