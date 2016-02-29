/* @flow */

import type {ModelAnnotation} from 'reactive-di/i/plugins/modelInterfaces'
import type {FromJS} from 'reactive-di/i/modelInterfaces'

function defaultFromJS<V: Object>(object: Object): V {
    return ((object: any): V)
}

export default function model<V: Object>(
    target: Class<V>,
    statePath: Array<string> = [],
    childs: Array<Class<*>> = [],
    fromJS: FromJS<V> = defaultFromJS
): ModelAnnotation<V> {
    return {
        kind: 'model',
        id: '',
        childs,
        target,
        statePath,
        fromJS
    }
}
