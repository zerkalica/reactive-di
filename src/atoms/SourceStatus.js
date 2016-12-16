// @flow

import type {ISourceStatus} from './interfaces'

export type SourceStatusType = 'pending' | 'complete' | 'error'

export type SourceStatusOpts = {
    type?: SourceStatusType;
    error?: ?Error;
}

export default class SourceStatus {
    complete: boolean
    pending: boolean
    error: ?Error

    constructor({type, error}?: SourceStatusOpts = {}) {
        (this: ISourceStatus) // eslint-disable-line
        this.complete = type === 'complete'
        this.pending = !type || type === 'pending'
        this.error = error || null
    }

    isEqual(status: ISourceStatus): boolean {
        return (status.complete && this.complete)
            || (status.pending && this.pending)
            || (!!status.error && status.error === this.error)
    }

    copy(opts: SourceStatusOpts): SourceStatus {
        const newStatus = new SourceStatus(opts)
        return newStatus.isEqual(this) ? this : newStatus
    }
}
