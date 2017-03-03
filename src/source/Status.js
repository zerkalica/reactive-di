// @flow

import type {IRawArg} from '../interfaces'
import type {IContext} from '../commonInterfaces'
import debugName from '../utils/debugName'

import type {ISource, ISourceStatus, IStatus} from './interfaces'


export default class Status<V: Object> {
    t: 3
    displayName: string
    id: number
    closed: boolean
    cached: ?ISourceStatus

    sources: ISource<ISourceStatus>[]

    context: IContext
    _resolved: boolean
    _rawStatuses: IRawArg[]
    _key: Class<ISourceStatus>

    constructor(
        key: Function,
        context: IContext
    ) {
        (this: IStatus<V>) // eslint-disable-line

        this.id = key._rdiId || ++context.binder.lastId // eslint-disable-line
        key._rdiId = this.id // eslint-disable-line
        this.displayName = key._rdiKey || debugName(key)

        this.t = 3
        this._resolved = false
        this.closed = false
        this.sources = []
        this.context = context
        this.cached = null
        this._rawStatuses = key.statuses
        this._key = key
    }

    resolve(): void {
        if (!this._resolved) {
            this._resolved = true
            const context = this.context
            context.binder.status = this
            context.resolveDeps(this._rawStatuses)
            context.binder.status = null
            return
        }

        const sources = this.sources
        for (let i = 0, l = sources.length; i < l; i++) {
            sources[i].resolve()
        }
    }

    get(): ISourceStatus {
        const sources = this.sources
        const newStatus: ISourceStatus = new this._key() // eslint-disable-line
        for (let i = 0, l = sources.length; i < l; i++) {
            const st: ISource<ISourceStatus> = sources[i]
            const status: ?ISourceStatus = st.cached
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
        if (!this.cached || !this.cached.isEqual(newStatus)) {
            this.cached = newStatus
        }

        return this.cached
    }
}
