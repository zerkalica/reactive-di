// @flow

import type {
    ISourceStatus,
    IStatusMeta,
    IStatus,
    IContext,
    IMaster
} from './interfaces'

export default class Status {
    t: 3
    displayName: string
    id: number
    closed: boolean
    cached: ?ISourceStatus

    masters: IMaster[]
    context: IContext
    _resolved: boolean
    _v: ISourceStatus
    _meta: IStatusMeta

    constructor(
        meta: IStatusMeta,
        context: IContext
    ) {
        (this: IStatus) // eslint-disable-line
        this.t = 3
        this._resolved = false
        this.closed = false
        this._meta = meta
        this.displayName = meta.name
        this.id = meta.id
        this.masters = []
        this.context = context
        this.cached = new meta.key({type: 'complete'}) // eslint-disable-line
        this._v = this.cached
    }

    resolve(): void {
        if (!this._resolved) {
            this._resolved = true
            const context = this.context
            context.binder.begin((this: IStatus), false)
            context.resolveDeps(this._meta.statuses)
            context.binder.end()
            return
        }

        const masters = this.masters
        for (let i = 0, l = masters.length; i < l; i++) {
            masters[i].resolve()
        }
    }

    get(): ISourceStatus {
        const statuses = this.masters
        const newStatus = new this._meta.key({type: 'complete'}) // eslint-disable-line
        for (let i = 0, l = statuses.length; i < l; i++) {
            const st = statuses[i]
            if (st.t !== 1) {
                throw new Error(`Can't handle non-source in Status: ${st.displayName}`)
            }
            const status = st.status || st.getStatus()
            if (status.pending) {
                newStatus.pending = true
                newStatus.complete = false
            } else if (status.error) {
                newStatus.error = status.error
                newStatus.complete = false
                newStatus.pending = false
                break
            }
        }
        if (!this._v.isEqual(newStatus)) {
            this._v = newStatus
        }
        this.cached = this._v
        return this.cached
    }
}
