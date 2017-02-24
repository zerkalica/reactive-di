// @flow

import type {SourceStatusOpts, ISourceStatus} from './interfaces'

export default class SourceStatus implements ISourceStatus {
    complete: boolean
    pending: boolean
    error: ?Error

    constructor(opts?: ?SourceStatusOpts) {
        this.complete = !opts || !!opts.complete
        this.pending = !!opts && !!opts.pending
        this.error = opts ? (opts.error || null) : null
    }

    isEqual(status: ISourceStatus): boolean {
        return (status.complete && this.complete)
            || (status.pending && this.pending)
            || (!!status.error && status.error === this.error)
    }

    copy(opts: SourceStatusOpts): ISourceStatus {
        const newStatus = new SourceStatus(opts)
        return newStatus.isEqual(this) ? this : newStatus
    }
}
