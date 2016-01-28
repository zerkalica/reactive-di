/* @flow */

import AsyncUpdaterImpl from './AsyncUpdaterImpl'
import type {
    DepId,
    Info
} from '../../../annotations/annotationInterfaces'
import type {
    Notifier,
    Cursor,
    FromJS
} from '../../../modelInterfaces'
import type {
    Cacheable,
    DepBase
} from '../../../nodes/nodeInterfaces'
import type {Observable} from '../../../observableInterfaces'
import type {
    FactoryDep
} from '../../factory/factoryInterfaces'
import {DepBaseImpl} from '../../pluginImpls'
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
        notifier: Notifier,
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
                notifier.notify()
            }
        }
        if (isAsync) {
            this.updater = new AsyncUpdaterImpl(
                cursor.set,
                base,
                notifier,
                dataOwners
            )
        }
    }
}
