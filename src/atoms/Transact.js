// @flow
import type {IMiddlewares, IDepInfo, IPullable, ICaller} from './interfaces'

function getCallerNames(caller: ICaller): string {
    return caller.names.join('.')
}

export default class Transact<C: IPullable<*>> {
    _consumers: C[] = []
    _callers: ICaller[] = []
    _middlewares: ?IMiddlewares
    _counter: number = 0

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
                this._getLastCaller()
            )
        }
    }

    begin(caller: ICaller): void {
        if (!caller.id) {
            caller.id = ++this._counter // eslint-disable-line
        }
        this._callers.push(caller)
    }

    _getLastCaller(): ICaller {
        const callers = this._callers
        const last: ?ICaller = callers[callers.length - 1]
        if (!last) {
            throw new Error(`Need to add wrap @actions before class ${callers.map(getCallerNames).join(' -> ')}`)
        }

        return last
    }

    createCaller(name?: ?string): ICaller {
        const lc = this._getLastCaller()
        return {
            ...lc,
            names: name ? lc.names.concat(name) : lc.names
        }
    }

    end(): void {
        this._callers.pop()
        if (this._callers.length === 0) {
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
}
