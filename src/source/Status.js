// @flow

import type {IRawArg} from '../interfaces'
import type {IContext} from '../commonInterfaces'
import debugName from '../utils/debugName'

import type {IGetable, IMaster, IRelationBinder, IComputed, ISourceStatus} from './interfaces'

import SourceStatus from './SourceStatus'

export default class Status implements IComputed<SourceStatus> {
    t: 0 = 0
    parent: ?IGetable<*> = null
    displayName: string
    id: number
    cached: ?SourceStatus = null
    closed: boolean = false
    masters: IMaster[] = []
    context: IContext

    refs: number

    _rawStatuses: IRawArg[]
    _key: Function

    _oldStatus: ?SourceStatus

    constructor(key: Function, context: IContext) {
        this.id = key._r0 || ++context.notifier.lastId // eslint-disable-line
        key._r0 = this.id // eslint-disable-line
        this.displayName = key.displayName || debugName(key)
        this.context = context
        this._rawStatuses = key.statuses
        this._key = key
    }

    _init(binder: IRelationBinder): void {
        const context = this.context
        if (binder.status) {
            throw new Error(`Use SourceStatus only as Component dependency: ${binder.debugStr('')}`)
        }
        binder.status = this
        context.resolveDeps(this._rawStatuses)
        binder.status = null
    }

    _resolved: boolean = false

    resolve(binder: IRelationBinder): void {
        if (!this._resolved) {
            this._resolved = true
            this._init(binder)
        }
        const masters = this.masters
        for (let i = 0, l = masters.length; i < l; i++) {
            masters[i].resolve(binder)
        }
    }

    reap(): void {
        throw new Error('Not implemented')
    }

    get(): SourceStatus {
        const masters = this.masters
        const ns: SourceStatus = new this._key() // eslint-disable-line
        for (let i = 0, l = masters.length; i < l; i++) {
            const master = masters[i]
            const status: ISourceStatus = master.status || master.getStatus()
            if (status === 'PENDING') {
                ns.pending = true
                ns.complete = false
            } else if (status !== 'COMPLETE') {
                ns.pending = false
                ns.complete = false
                ns.error = status
                break
            }
        }

        if (!this._oldStatus || !this._oldStatus.isEqual(ns)) {
            this._oldStatus = ns
        }
        this.cached = this._oldStatus

        return this.cached
    }
}
