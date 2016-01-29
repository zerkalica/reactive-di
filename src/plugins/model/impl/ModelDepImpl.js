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
    base: DepBase<V>;

    fromJS: FromJS<V>;
    dataOwners: Array<Cacheable>;
    get: () => V;

    set: (value: V) => void;
    updater: ?AsyncUpdater<V, E>;
    loader: ?FactoryDep<Observable<V, E>>;

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
        this.loader = loader
        const base = this.base = new DepBaseImpl(id, info, cursor.get())

        this.fromJS = fromJS
        const dataOwners = this.dataOwners = []
        this.get = cursor.get

        this.set = function set(value: V): void {
            if (cursor.set(value)) {
                base.value = value
                for (let i = 0, l = dataOwners.length; i < l; i++) {
                    dataOwners[i].isRecalculate = true
                }
                notify()
            }
        }
        if (isAsync) {
            this.updater = new AsyncUpdaterImpl(
                cursor.set,
                base,
                notify,
                dataOwners
            )
        }
    }
}
