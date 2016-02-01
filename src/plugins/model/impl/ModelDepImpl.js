/* @flow */

import AsyncUpdaterImpl from './AsyncUpdaterImpl'
import type {
    DepId,
    Info
} from '../../../interfaces/annotationInterfaces'
import {DepBaseImpl} from '../../../core/pluginImpls'
import type {
    Notify,
    Cursor,
    FromJS
} from '../../../interfaces/modelInterfaces'
import type {
    Cacheable,
    DepBase
} from '../../../interfaces/nodeInterfaces'
import type {Observable} from '../../../interfaces/observableInterfaces'
import type {
    FactoryDep
} from '../../factory/factoryInterfaces'
import type {
    ModelDep,
    AsyncUpdater
} from '../modelInterfaces'

// implements ModelDep
export default class ModelDepImpl<V: Object, E> {
    kind: 'model';
    base: DepBase;

    fromJS: FromJS<V>;
    dataOwners: Array<Cacheable>;

    set: (value: V) => void;
    updater: ?AsyncUpdater<V, E>;
    _loader: ?FactoryDep<Observable<V, E>>;

    _cursor: Cursor<V>;
    _fromJS: FromJS<V>;
    _notify: Notify;

    _value: V;

    constructor(
        id: DepId,
        info: Info,
        cursor: Cursor<V>,
        fromJS: FromJS<V>,
        notify: Notify,
        isAsync: boolean = false,
        loader: ?FactoryDep<Observable<V, E>> = null
    ) {
        this.kind = 'model'
        this._loader = loader
        const base = this.base = new DepBaseImpl(id, info)
        this._cursor = cursor
        this._fromJS = fromJS
        this._notify = notify

        this.dataOwners = []

        if (isAsync) {
            this.updater = new AsyncUpdaterImpl(
                cursor.set,
                base,
                notify,
                this.dataOwners
            )
        }
    }

    set(value: V): void {
        if (this._cursor.set(value)) {
            this._value = value
            const {dataOwners} = this
            for (let i = 0, l = dataOwners.length; i < l; i++) {
                dataOwners[i].isRecalculate = true
            }
            this._notify()
        }
    }

    setFromJS(data: Object): void {
        this._cursor.set(this._fromJS(data))
    }

    resolve(): V {
        const {base, updater, _loader: loader} = this
        if (!base.isRecalculate) {
            return this._value
        }
        if (updater && loader && !updater.isSubscribed) {
            const load: Observable<V, E> = loader.resolve();
            updater.subscribe(load)
        }
        base.isRecalculate = false
        this._value = this._cursor.get()

        return this._value
    }
}
