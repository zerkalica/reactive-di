// @flow

import type {IComponentUpdater, ITraceId, IGetable, INotifier, ILogger, IConsumer} from './interfaces'

function mapName({displayName}: {displayName: string}): string {
    return displayName
}

export default class Notifier implements INotifier {
    lastId: number = 0
    opId: number = 0
    parentId: number = 0
    consumers: IConsumer[] = []
    trace: string = ''

    _id: number = 0
    _logger: ?IGetable<ILogger> = null
    _inFlush: boolean = false
    _inSession: boolean = false

    begin(name: string, id?: number): ITraceId {
        const tid = this.trace
        this.trace = name
        this._id = id || ++this.opId
        this._inSession = true
        return tid
    }

    end(tid: ITraceId): void {
        this.trace = tid
        this._id = this.opId
        if (this._inSession) {
            this._inSession = !!tid
            this._flush()
        }
    }

    error(name: string, err: Error): void {
        this._inSession = false
        this._inFlush = false
        this._error(name, err)
    }

    _error(name: string, v: Error) {
        const logger = this._logger
        if (logger) {
            const oldId = this.begin(this.trace || 'Logger.error', this._id)
            ;(logger.cached || logger.get()).onError(v, name)
            this.end(oldId)
        }
    }

    _log<V>(modelName: string, newValue: V, oldValue: V): void {
        const logger = this._logger
        if (logger) {
            const oldId = this.begin(this.trace || 'Logger.log', this._id)
            ;(logger.cached || logger.get()).onSetValue({
                trace: this.trace,
                opId: this._id,
                modelName,
                oldValue,
                newValue
            })
            this.end(oldId)
        }
    }

    _flush() {
        let consumers = this.consumers
        if (this._inFlush || this._inSession || !consumers.length) {
            return
        }
        this._inFlush = true
        const loggerAtom = this._logger
        let logger: ?ILogger = null
        const updaters: IComponentUpdater<*>[] = []
        let count = 0
        do {
            /**
             * consumer.render pulls state, but pulling state can cause state changes (updates in pull hooks)
             * After pull check if pulling state updates this.consumers - pull once again
             */
            this.consumers = []
            for (let i = 0, l = consumers.length; i < l; i++) {
                const consumer = consumers[i]
                if (!consumer.cached) {
                    consumer.actualize(updaters)
                }
            }
            if (loggerAtom) {
                logger = loggerAtom.cached || loggerAtom.get()
            }
            count++
            if (count > 100) {
                throw new Error('Circular rerenders detected: ' + consumers.map(mapName).join(', '))
            }
            consumers = this.consumers
        } while (consumers.length)
        const ids = []
        for (let i = 0; i < updaters.length; i++) {
            ids[updaters[i].id] = true
        }
        /**
         * ComponentA composes ComponentB
         * changing state in ComponentA and ComponentB
         * rerender only ComponentA
         */
        for (let i = 0; i < updaters.length; i++) {
            const updater = updaters[i]
            if (!ids[updater.parentId]) {
                updater.forceUpdate()
                if (logger) {
                    logger.onRender(updater)
                }
            }
        }

        this._inFlush = false
    }

    changed<V>(name: string, newValue: V, oldValue: V): void {
        this._log(name, newValue, oldValue)
        if (newValue instanceof Error) {
            this._error(name, newValue)
        }
        this._flush()
    }
}
