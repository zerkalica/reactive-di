/* @flow */
import type {Dependency} from '../../interfaces/annotationInterfaces'
import type ModelInfo from './modelInterfaces'
import type {FromJS} from '../../interfaces/modelInterfaces'

// implements ModelInfo
export default class ModelInfoImpl<V> {
    childs: Array<Dependency>;
    statePath: Array<string>;
    fromJS: FromJS<V>;

    constructor() {
        this.childs = []
        this.statePath = []
    }
}
