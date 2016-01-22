/* @flow */

import DepBaseImpl from './DepBaseImpl'
import EntityMetaImpl, {
    setPending,
    setSuccess,
    setError
} from './EntityMetaImpl'
import type {
    DepId,
    DepFn,
    Info
} from '../../annotations/annotationInterfaces'
import type {Cursor, FromJS} from '../../modelInterfaces'
import type {Observable, Subscription} from '../../observableInterfaces'
import type {
    EntityMeta,
    DepBase,
    ModelState,
    Updater,
    ModelDep,
    LoaderDep,
    FactoryDep,
    AnyDep,
    Notifier
} from '../nodeInterfaces'

// implements ModelState
class ModelStateImpl<V, E> {
    pending: () => void;
    success: (value: V) => void;
    error: (error: E) => void;

    constructor(
        pending: () => void,
        success: (value: V) => void,
        error: (error: E) => void
    ) {
        this.pending = pending
        this.success = success
        this.error = error
    }
}

const fakeSubscription: Subscription = {
    unsubscribe(): void {}
}

// implements Updater
export class UpdaterImpl<V, E> {
    isDirty: boolean;
    loader: LoaderDep<V, E>;
    observable: ?Observable<V, E>;
    subscription: Subscription;
    meta: EntityMeta<E>;

    constructor(loader: LoaderDep<V, E>) {
        this.loader = loader
        this.isDirty = true
        this.subscription = fakeSubscription
        this.meta = new EntityMetaImpl()
    }
}

// implements ModelDep
export default class ModelDepImpl<V: Object, E> {
    kind: 'model';
    id: DepId;
    base: DepBase<V, E>;

    childs: Array<ModelDep>;
    state: ModelState<V, E>;
    updater: ?Updater<V, E>;
    fromJS: FromJS<V>;
    get: () => V;

    constructor(
        id: DepId,
        info: Info,
        notifier: Notifier,
        cursor: Cursor<V>,
        fromJS: FromJS<V>
    ) {
        this.kind = 'model'
        this.id = id
        this.fromJS = fromJS
        const base = this.base = new DepBaseImpl(info)
        this.childs = []
        const relations = base.relations

        // chrome not optimized for bind syntax: place methods in constructor
        function notify(): void {
            base.isRecalculate = true
            for (let i = 0, l = relations.length; i < l; i++) {
                relations[i].base.isRecalculate = true
            }
            notifier.notify()
        }

        function get(): V {
            return cursor.get()
        }

        function pending(): void {
            const newMeta = setPending(base.meta)
            if (base.meta === newMeta) {
                // if previous value is pending - do not handle this value: only first
                return
            }
            notify()
            base.meta = newMeta
        }

        function success(value: V): void {
            const isDataChanged = cursor.set(value)
            const newMeta = setSuccess(base.meta)
            if (newMeta !== base.meta || isDataChanged) {
                notify()
            }
            base.meta = newMeta
        }

        function error(reason: E): void {
            const newMeta = setError(base.meta, reason)
            if (newMeta !== base.meta) {
                notify()
            }
            base.meta = newMeta
        }

        this.get = get

        this.state = new ModelStateImpl(pending, success, error)
    }
}
