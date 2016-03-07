/* @flow */

import type {ModelAnnotation} from 'reactive-di/i/plugins/modelInterfaces'
import type {FromJS} from 'reactive-di/i/modelInterfaces'
import driver from 'reactive-di/pluginsCommon/driver'

function defaultFromJS<V: Object>(object: Object): V {
    return ((object: any): V)
}

export function model<V: Object>(
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

export function modelAnnotation<V: Function>(target: V): V {
    return driver.annotate(target, model(target))
}
