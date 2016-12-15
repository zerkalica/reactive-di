// @flow

import type {ISourceStatus} from './interfaces'

export type SourceStatusType = 'pending' | 'complete' | 'error'

export default class SourceStatus {
    complete: boolean
    pending: boolean
    error: ?Error

    constructor(
        type?: SourceStatusType,
        error?: ?Error,
    ) {
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

    copy(
        type?: SourceStatusType,
        error?: ?Error
    ): SourceStatus {
        const newStatus = new SourceStatus(type, error)
        return newStatus.isEqual(this) ? this : newStatus
    }
}
