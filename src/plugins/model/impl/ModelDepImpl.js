/* @flow */

import {DepBaseImpl} from 'reactive-di/pluginsCommon/pluginImpls'
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
    ModelAnnotation,
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
        annotation: ModelAnnotation<V>,
        cursor: Cursor<V>,
    ) {
        this.kind = 'model'
        this.base = new DepBaseImpl(annotation)
        this.base.relations.push(annotation.id)
        this._cursor = cursor
        this._fromJS = annotation.fromJS

        this.dataOwners = []
    }

    reset(): void {
        const {dataOwners} = this
        for (let i = 0, l = dataOwners.length; i < l; i++) {
            dataOwners[i].isRecalculate = true
        }
    }

    set(value: V): boolean {
        const isChanged: boolean = this._cursor.set(value);
        if (isChanged) {
            this._value = value
            this.reset()
        }

        return isChanged
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
