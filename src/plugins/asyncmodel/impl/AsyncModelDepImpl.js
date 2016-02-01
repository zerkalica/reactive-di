/* @flow */

import merge from '../../../utils/merge'
import EntityMetaImpl from '../EntityMetaImpl'
import {DepBaseImpl} from '../../../core/pluginImpls'
import type {
    DepId,
    Info
} from '../../../interfaces/annotationInterfaces'
import type {
    Notify,
    Cursor,
    FromJS
} from '../../../interfaces/modelInterfaces'
import type {
    Cacheable,
    DepBase
} from '../../../interfaces/nodeInterfaces'
import type {
    Subscription,
    Observable,
    Observer
} from '../../../interfaces/observableInterfaces'
import type {
    FactoryDep
} from '../../factory/factoryInterfaces'
import type {
    EntityMeta,
    AsyncModelDep
} from '../asyncmodelInterfaces'

export function setPending<E>(meta: EntityMeta<E>): EntityMeta<E> {
    return merge(meta, {
        pending: true,
        rejected: false,
        fulfilled: false,
        reason: null
    })
}

export function setSuccess<E>(meta: EntityMeta<E>): EntityMeta<E> {
    return merge(meta, {
        pending: false,
        rejected: false,
        fulfilled: true,
        reason: null
    })
}

export function setError<E>(meta: EntityMeta<E>, reason: E): EntityMeta<E> {
    return merge(meta, {
        pending: false,
        rejected: true,
        fulfilled: false,
        reason
    })
}

// implements AsyncModelDep, Oserver
export default class AsyncModelDepImpl<V: Object, E> {
    kind: 'asyncmodel';
    base: DepBase;
    dataOwners: Array<Cacheable>;

    meta: EntityMeta<E>;
    metaOwners: Array<Cacheable>;

    _loader: ?FactoryDep<Observable<V, E>>;

    _cursor: Cursor<V>;
    _fromJS: FromJS<V>;
    _notify: Notify;

    _value: V;

    _subscription: ?Subscription;

    constructor(
        id: DepId,
        info: Info,
        cursor: Cursor<V>,
        fromJS: FromJS<V>,
        notify: Notify,
        loader: ?FactoryDep<Observable<V, E>>
    ) {
        this.kind = 'asyncmodel'
        this._loader = loader || null

        const base = this.base = new DepBaseImpl(id, info)
        this._cursor = cursor
        this._fromJS = fromJS
        this._notify = notify
        this._subscription = null

        this.dataOwners = []
        this.metaOwners = []
        this.meta = new EntityMetaImpl({pending: true})
    }

    _notifyMeta(): void {
        const {metaOwners} = this
        for (let i = 0, l = metaOwners.length; i < l; i++) {
            metaOwners[i].isRecalculate = true
        }
        this._notify()
    }

    _notifyData(): void {
        const {dataOwners} = this
        for (let i = 0, l = dataOwners.length; i < l; i++) {
            dataOwners[i].isRecalculate = true
        }
        this._notify()
    }

    _pending(): void {
        const newMeta: EntityMeta<E> = setPending(this.meta);
        if (this.meta === newMeta) {
            // if previous value is pending - do not handle this value: only first
            return
        }
        this.meta = newMeta
        this._notifyMeta()
    }

    unsubscribe(): void {
        if (this._subscription) {
            this._subscription.unsubscribe()
            this._subscription = null
        }
    }

    next(value: V): void {
        if (this._cursor.set(value)) {
            this._value = value
            this._notifyData()
        }
        const newMeta: EntityMeta<E> = setSuccess(this.meta);
        if (newMeta !== this.meta) {
            this.meta = newMeta
            this._notifyMeta()
        }
    }

    error(errorValue: E): void {
        const newMeta: EntityMeta<E> = setError(this.meta, errorValue);
        this.unsubscribe()
        if (newMeta !== this.meta) {
            this.meta = newMeta
            this._notifyMeta()
        }
    }

    complete(completeValue?: V): void {
        this.unsubscribe()
    }

    set(value: Observable<V, E>): void {
        if (this._subscription) {
            this._subscription.unsubscribe()
        }
        this._pending()
        this._subscription = value.subscribe((this: Observer<V, E>))
    }

    setFromJS(data: Object): void {
        if (this._cursor.set(this._fromJS(data))) {
            this._notifyData()
        }
    }

    resolve(): V {
        const {base} = this
        if (!base.isRecalculate) {
            return this._value
        }
        if (this._loader && !this._subscription) {
            const dataSource: Observable<V, E> = this._loader.resolve();
            this.set(dataSource)
        }
        base.isRecalculate = false
        this._value = this._cursor.get()

        return this._value
    }
}
