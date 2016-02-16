/* @flow */
import type {Dependency} from 'reactive-di/i/annotationInterfaces'
import type ModelInfo from '~/plugins/model/modelInterfaces' // eslint-disable-line
import type {FromJS} from 'reactive-di/i/modelInterfaces'

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
