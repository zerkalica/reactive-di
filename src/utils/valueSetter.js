// @flow

import type {INotifier, ISourceStatus, ISource} from '../atoms/interfaces'
import {setterKey} from '../atoms/interfaces'

export type SetterResult<V: Object> = {
    (v: $Shape<$Subtype<V>>): void;
    [id: $Keys<V>]: (v: mixed) => void;
}

export class BaseModel {
    copy(rec: $Shape<this>): this {
        return Object.assign((Object.create(this.constructor.prototype): any), this, rec)
    }
}

export class Loader<V: Object> {
    _source: ISource<V>
    _status: ISource<ISourceStatus>
    _isCanceled: boolean
    _promise: Promise<$Shape<V>>
    _notifier: INotifier

    constructor(source: ISource<V>, promise: Promise<$Shape<V>>) {
        this._source = source
        this._status = source.getStatus()
        this._isCanceled = false
        this._notifier = source.context.notifier
        this._status.merge({pending: true})
        this._promise = promise
            .then((data: $Shape<V>) => this._resolve(data))
            .catch((error: Error) => this._reject(error))
    }

    _resolve(data: $Shape<V>): void {
        if (!this._isCanceled) {
            this._source.merge(data)
            this._status.merge({complete: true})
            this._notifier.commit()
        }
    }

    _reject(error: Error): void {
        if (!this._isCanceled) {
            this._status.merge({error})
            this._notifier.commit()
        }
    }

    cancel(): void {
        this._isCanceled = true
    }
}

export class Updater {
    run<V: Object>(v: V, promise: Promise<$Shape<V>>): Loader<V> {
        return new Loader((v: any)[setterKey], promise)
    }
}
