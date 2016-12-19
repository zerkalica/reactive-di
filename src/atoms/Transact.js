// @flow
import type {IPullable} from './interfaces'

export default class Transact<C: IPullable<*>> {
    _consumers: C[] = []

    notify(consumers: C[], flush?: boolean): void {
        const ac = this._consumers
        this._consumers = ac.length
            ? ac.concat(consumers)
            : consumers
        if (flush) {
            this.commit()
        }
    }

    commit(): void {
        const consumers = this._consumers
        for (let i = 0, l = consumers.length; i < l; i++) {
            const consumer = consumers[i]
            if (!consumer.cached && !consumer.closed) {
                consumer.pull()
            }
        }

        this._consumers = []
    }
}
