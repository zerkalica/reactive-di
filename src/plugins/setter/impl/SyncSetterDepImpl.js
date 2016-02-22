/* @flow */

import {DepBaseImpl} from 'reactive-di/pluginsCommon/pluginImpls'
import type {
    DepId,
    Info
} from 'reactive-di/i/annotationInterfaces'
import type {
    Invoker,
    DepBase
} from 'reactive-di/i/nodeInterfaces'
import type {
    SetFn,
    SyncSetterDep // eslint-disable-line
} from 'reactive-di/i/plugins/setterInterfaces'
import type {ModelDep} from 'reactive-di/i/plugins/modelInterfaces'

// implements SyncSetterDep
export default class SyncSetterDepImpl<V: Object> {
    kind: 'syncsetter';
    base: DepBase;
    _value: SetFn;

    constructor(
        id: DepId,
        info: Info,
        notify: () => void,
        model: ModelDep<V>,
        setterInvoker: Invoker<V>
    ) {
        this.kind = 'syncsetter'
        this.base = new DepBaseImpl(id, info)
        this._value = function setValue(...args: Array<any>): void {
            const result: V = setterInvoker.invoke(args);
            model.set(result)
            notify()
        }
    }

    resolve(): SetFn {
        return this._value
    }
}
