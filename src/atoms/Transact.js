// @flow
import type {IComputed, ILogger, IPullable} from './interfaces'

export default class Transact<C: IPullable<*>> {
    _consumers: C[] = []

    logger: ?IComputed<ILogger>
    trace: string = ''
    asyncType: null | 'next' | 'error' | 'complete' = null
    callerId: number = 0

    lastId: number = 0

    notify<V>(consumers: C[], modelName: string, oldValue: V, newValue: V): void {
        const ac = this._consumers
        this._consumers = ac.length
            ? ac.concat(consumers)
            : consumers
        if (this.logger) {
            this.logger.get().onSetValue({
                trace: this.trace,
                callerId: this.callerId,
                asyncType: this.asyncType,
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

    end(): void {
        if (!this.trace) {
            const consumers = this._consumers
            // consumer.pull can recursively run Transact.end, protect from this
            this._consumers = []
            for (let i = 0, l = consumers.length; i < l; i++) {
                const consumer = consumers[i]
                if (!consumer.cached && !consumer.closed) {
                    consumer.pull()
                }
            }
        }
    }
}
