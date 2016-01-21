/* @flow */

import CacheImpl from './CacheImpl'
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
import type {
    EntityMeta,
    FromJS,
    ModelState,
    Updater,
    ModelDep,
    FactoryDep,
    Cache,
    AnyDep,
    Cursor,
    Notifier
} from '../nodeInterfaces'

import type {Subscription} from '../../observableInterfaces'

// implements ModelState
class ModelStateImpl<T> {
    pending: () => void;
    success: (value: T) => boolean;
    error: (error: Error) => void;

    constructor(
        pending: () => void,
        success: (value: T) => boolean,
        error: (error: Error) => void
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
class UpdaterImpl {
    isDirty: boolean;
    loader: FactoryDep<void, DepFn<void>>;
    subscription: Subscription;

    constructor(loader: FactoryDep<void, DepFn<void>>) {
        this.loader = loader
        this.isDirty = true
        this.subscription = fakeSubscription
    }
}


// implements ModelDep
export default class ModelDepImpl<T: Object> {
    kind: 'model';
    id: DepId;
    meta: EntityMeta;
    cache: Cache<T>;
    info: Info;
    relations: Array<AnyDep>;
    childs: Array<ModelDep>;
    fromJS: FromJS<T>;
    state: ModelState<T>;
    updater: ?Updater;
    get: () => T;

    constructor(
        id: DepId,
        info: Info,
        notifier: Notifier,
        cursor: Cursor<T>,
        relations: Array<AnyDep>,
        loader: ?FactoryDep<void, DepFn<void>>
    ) {
        this.kind = 'model'
        this.id = id
        this.meta = new EntityMetaImpl()
        this.info = info
        this.relations = relations
        this.childs = []

        const self = this
        const cache = this.cache = new CacheImpl()
        this.updater = loader ? new UpdaterImpl(loader) : null

        // chrome not optimized for bind syntax: place methods in constructor
        function notify(): void {
            cache.isRecalculate = true
            for (let i = 0, l = relations.length; i < l; i++) {
                relations[i].cache.isRecalculate = true
            }
            notifier.notify()
        }

        function get(): T {
            return cursor.get()
        }

        function pending(): void {
            const newMeta = setPending(self.meta)
            if (self.meta === newMeta) {
                // if previous value is pending - do not handle this value: only first
                return
            }
            notify()
            self.meta = newMeta
        }

        function success(value: T): void {
            const isDataChanged = cursor.set(value)
            const newMeta = setSuccess(self.meta)
            if (newMeta !== self.meta || isDataChanged) {
                notify()
            }
            self.meta = newMeta
        }

        function error(reason: Error): void {
            const newMeta = setError(self.meta, reason)
            if (newMeta !== self.meta) {
                notify()
            }
            self.meta = newMeta
        }

        this.get = get

        this.state = new ModelStateImpl(pending, success, error)
    }
}
