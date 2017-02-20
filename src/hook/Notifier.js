// @flow

import type {ILogger} from '../interfaces'
import type {IGetable} from '../utils/resolveArgs'

import type {IHasForceUpdate, INotifierItem} from './interfaces'

export default class Notifier {
    logger: ?IGetable<ILogger>

    _consumers: INotifierItem[] = []

    trace: string = ''
    opId: number = 0

    notify<V>(consumers: INotifierItem[], modelName: string, oldValue: V, newValue: V): void {
        if (!this.trace.length) {
            throw new Error('Call begin before notify')
        }
        const ac = this._consumers
        this._consumers = ac.length
            ? ac.concat(consumers)
            : consumers
        if (this.logger) {
            this.logger.get().onSetValue({
                trace: this.trace,
                opId: this.opId,
                modelName,
                oldValue,
                newValue
            })
        }
    }

    onError(e: Error, name: string) {
        if (this.logger) {
            this.logger.get().onError(e, name)
        }
    }

    flush(): void {
        if (this.trace) {
            return
        }

        const consumers = this._consumers
        // consumer.pull can recursively run Transact.end, protect from this
        this._consumers = []
        const upd: IHasForceUpdate[] = []
        for (let i = 0, l = consumers.length; i < l; i++) {
            const consumer = consumers[i]
            if (!consumer.cached && !consumer.closed) {
                const updater: ?IHasForceUpdate = consumer.pull()
                if (updater) {
                    upd.push(updater)
                }
            }
        }

        for (let i = 0, l = upd.length; i < l; i++) {
            upd[i].forceUpdate()
        }
    }
}
