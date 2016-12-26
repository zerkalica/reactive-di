// @flow
import type {IMiddlewares, IDepInfo, IPullable} from './interfaces'

export default class Transact<C: IPullable<*>> {
    _consumers: C[] = []
    _middlewares: ?IMiddlewares
    trace: string = ''
    asyncType: null | 'next' | 'error' | 'complete' = null
    callerId: number = 0
    renderId: number = 0

    constructor(
        middlewares?: ?IMiddlewares
    ) {
        this._middlewares = middlewares
    }

    notify<V>(consumers: C[], info: IDepInfo<V>, value: V): void {
        const ac = this._consumers
        this._consumers = ac.length
            ? ac.concat(consumers)
            : consumers
        if (this._middlewares) {
            this._middlewares.onSetValue(
                info,
                value,
                this
            )
        }
    }

    end(): void {
        if (!this.trace) {
            const consumers = this._consumers
            for (let i = 0, l = consumers.length; i < l; i++) {
                const consumer = consumers[i]
                if (!consumer.cached && !consumer.closed) {
                    consumer.pull()
                }
            }
            this.renderId++
            this._consumers = []
        }
    }
}
