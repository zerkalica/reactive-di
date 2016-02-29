/* @flow */

import {DepBaseImpl} from 'reactive-di/pluginsCommon/pluginImpls'
import type {
    Invoker,
    DepBase
} from 'reactive-di/i/nodeInterfaces'
import type {
    SetFn,
    SyncSetterDep // eslint-disable-line
} from 'reactive-di/i/plugins/setterInterfaces'
import type {ModelDep} from 'reactive-di/i/plugins/modelInterfaces'
import type {SyncSetterAnnotation} from 'reactive-di/i/plugins/setterInterfaces'

// implements SyncSetterDep
export default class SyncSetterDepImpl<V: Object> {
    kind: 'syncsetter';
    base: DepBase;
    _value: SetFn;

    constructor(
        annotation: SyncSetterAnnotation<V>,
        notify: () => void,
        model: ModelDep<V>,
        setterInvoker: Invoker<V>
    ) {
        this.kind = 'syncsetter'
        this.base = new DepBaseImpl(annotation)
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
