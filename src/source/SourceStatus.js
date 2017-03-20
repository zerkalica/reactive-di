// @flow

export type SourceStatusOpts = {
    complete?: boolean;
    pending?: boolean;
    error?: ?Error;
}

export default class SourceStatus {
    complete: boolean
    pending: boolean
    error: ?Error

    constructor(opts?: ?SourceStatusOpts) {
        this.complete = !opts || !!opts.complete
        this.pending = !!opts && !!opts.pending
        this.error = opts ? (opts.error || null) : null
    }

    isEqual(status: SourceStatus): boolean {
        return (status.complete && this.complete)
            || (status.pending && this.pending)
            || (!!status.error && status.error === this.error)
    }

    merge(statuses: SourceStatus[]): SourceStatus {
        const newStatus: SourceStatus = new SourceStatus()
        for (let i = 0, l = statuses.length; i < l; i++) {
            const status: ?SourceStatus = statuses[i]
            if (!status || status.pending) {
                newStatus.pending = true
                newStatus.complete = false
            } else if (status.error) {
                newStatus.error = status.error
                newStatus.complete = false
                newStatus.pending = false
                break
            }
        }

        return this.isEqual(newStatus) ? this : newStatus
    }
}
