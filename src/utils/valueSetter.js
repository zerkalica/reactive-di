// @flow

import type {INotifier, ISourceStatus, ISource, ISettable} from '../atoms/interfaces'
import {setterKey} from '../atoms/interfaces'

class ValueProxy<V> {
    _flush: boolean
    _setter: ISettable<V>

    constructor(setter: ISettable<V>, noFlush: boolean) {
        this._flush = !!noFlush
        this._setter = setter
    }

    apply(target: any, that: any, args: mixed[]) {
        this._setter.merge(args[0], this._flush)
    }

    get(target: any, name: string): any {
        const flush = this._flush
        const setter = this._setter
        return function setVal(v: mixed): void {
            setter.merge({[name]: v}, flush)
        }
    }

    set(target: any, name: string, val: any): boolean {
        this._setter.merge({[name]: val}, this._flush)
        return true
    }
}

function empty() {}

export type SetterResult<V: Object> = {
    (v: $Shape<$Subtype<V>>): void;
    [id: $Keys<V>]: (v: mixed) => void;
}

export default function valueSetter<V: Object>(
    v: V,
    noFlush?: boolean
): SetterResult<V> {
    return (new Proxy(
        empty,
        (new ValueProxy(
            (v: any)[setterKey],
            noFlush || false
        ): any)
    ): any)
}

export function statusSetter(v: Object, noFlush?: boolean): SetterResult<ISourceStatus> {
    return (new Proxy(
        empty,
        (new ValueProxy(
            (v: any)[setterKey].getStatus(),
            noFlush || false
        ): any)
    ): any)
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
