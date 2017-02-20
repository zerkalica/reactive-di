// @flow

import type {SourceStatusOpts, ISourceStatus} from './interfaces'

export default class SourceStatus<V: Object> implements ISourceStatus<V> {
    complete: boolean
    pending: boolean
    error: ?Error
    promise: Promise<V>

    constructor(opts?: ?SourceStatusOpts<V>) {
        this.complete = !opts || !!opts.complete
        this.pending = !!opts && !!opts.pending
        this.error = opts ? (opts.error || null) : null
        this.promise = opts
            ? opts.promise || this._createPromise()
            : this._createPromise()
    }

    _resolve: (v: V) => void
    _reject: (e: Error) => void
    _createPromise(): Promise<V> {
        return new Promise((resolve: (v: V) => void, reject: (e: Error) => void) => {
            this._resolve = resolve
            this._reject = reject
        })
    }

    isEqual(status: ISourceStatus<V>): boolean {
        return (status.complete && this.complete)
            || (status.pending && this.pending)
            || (!!status.error && status.error === this.error)
    }

    copy(opts: SourceStatusOpts<V>): ISourceStatus<V> {
        const newStatus = new SourceStatus(opts)
        return newStatus.isEqual(this) ? this : newStatus
    }
}
