/* @flow */

import type {
    DepId,
    Info
} from 'reactive-di/i/annotationInterfaces'
import {DepBaseImpl} from 'reactive-di/core/pluginImpls'
import type {
    Notify,
    Cursor,
    FromJS
} from 'reactive-di/i/modelInterfaces'
import type {
    Cacheable,
    DepBase
} from 'reactive-di/i/nodeInterfaces'
import type {
    ModelDep // eslint-disable-line
} from 'reactive-di/i/plugins/modelInterfaces'

// implements ModelDep
export default class ModelDepImpl<V: Object> {
    kind: 'model';
    base: DepBase;

    fromJS: FromJS<V>;
    dataOwners: Array<Cacheable>;

    _cursor: Cursor<V>;
    _fromJS: FromJS<V>;
    _notify: Notify;

    _value: V;

    constructor(
        id: DepId,
        info: Info,
        cursor: Cursor<V>,
        fromJS: FromJS<V>
    ) {
        this.kind = 'model'
        this.base = new DepBaseImpl(id, info)
        this.base.relations.push(id)
        this._cursor = cursor
        this._fromJS = fromJS

        this.dataOwners = []
    }

    _notifyData(): void {
        const {dataOwners} = this
        for (let i = 0, l = dataOwners.length; i < l; i++) {
            dataOwners[i].isRecalculate = true
        }
    }

    set(value: V): void {
        if (this._cursor.set(value)) {
            this._value = value
            this._notifyData()
        }
    }

    setFromJS(data: Object): void {
        this.set(this._fromJS(data))
    }

    resolve(): V {
        const {base} = this
        if (!base.isRecalculate) {
            return this._value
        }
        base.isRecalculate = false
        this._value = this._cursor.get()

        return this._value
    }
}
