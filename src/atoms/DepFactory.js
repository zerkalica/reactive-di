// @flow

import type {
    IKey,
    IContext,
    IConsumerFactory,
    ISource,
    IComputed,
    IStatus
} from './interfaces'

import debugName from '../utils/debugName'

import Status from './Status'
import Source from './Source'
import ConsumerFactory from './ConsumerFactory'
import Computed from './Computed'

declare class Reflect {
    static getMetadata<V>(key: string, target: Function): V;
}

const emptyObj = {}

export default class DepFactory<Element> {
    _lastId: number
    _values: {[id: string]: any}
    _defaultErrorComponent: IKey

    constructor(
        values?: {[id: string]: any},
        defaultErrorComponent: IKey
    ) {
        this._lastId = 0
        this._values = values || {}
        this._defaultErrorComponent = defaultErrorComponent
    }

    consumer<V>(key: Function, context: IContext): IConsumerFactory<V, Element> {
        const componentMeta = key._rdiCmp || emptyObj
        const register = componentMeta.register || null
        const name = key._rdiKey || debugName(key)

        const id = key._rdiId || ++this._lastId // eslint-disable-line
        key._rdiId = id // eslint-disable-line

        return new ConsumerFactory(
            {
                id,
                name,
                key,
                args: key._rdiArgs || null,
                hook: key._rdiHook || null,
                errorComponent: componentMeta.onError || this._defaultErrorComponent,
                register
            },
            context
        )
    }

    computed<V>(key: Function, context: IContext, isEnder?: boolean): IComputed<V> {
        const id = key._rdiId || ++this._lastId // eslint-disable-line
        key._rdiId = id // eslint-disable-line

        return new Computed(
            {
                id,
                name: key._rdiKey || debugName(key),
                key,
                func: key._rdiFn || false,
                args: key._rdiArgs || null,
                ender: key._rdiEnd || isEnder || false,
                hook: key._rdiHook || null
            },
            context
        )
    }

    source<V>(key: Function, context: IContext): ISource<V> {
        const instance = !!key._rdiInst
        const name = key._rdiKey || debugName(key)
        const configValue = this._values[name] || null
        let initialValue: ?V
        if (configValue) {
            initialValue = instance
                ? configValue
                : Object.assign(new key(), configValue) // eslint-disable-line
        } else {
            initialValue = (new key(): any) // eslint-disable-line
        }

        const id = key._rdiId || (++this._lastId, ++this._lastId) // eslint-disable-line
        key._rdiId = id // eslint-disable-line

        return new Source(
            {
                id,
                name,
                key,
                initialValue,
                configValue,
                hook: key._rdiHook || null
            },
            context
        )
    }

    status(key: Function, context: IContext): IStatus {
        const id = key._rdiId || ++this._lastId // eslint-disable-line
        key._rdiId = id // eslint-disable-line
        return new Status({
            id,
            name: key._rdiKey || debugName(key),
            key,
            statuses: key.statuses
        }, context)
    }

    anyDep<V>(
        k: Function,
        context: IContext
    ): ISource<V> | IComputed<V> | IStatus {
        if (k._rdiKey) {
            return this.source(k, context)
        } else if (k.statuses) {
            return this.status(k, context)
        } else if (k._rdiAbs) {
            throw new Error(`Need register Abstract entity ${context.binder.debugStr(k)}`)
        }

        return this.computed(k, context)
    }

    any<V>(
        k: Function,
        context: IContext
    ): ISource<V> | IComputed<V> | IStatus | IConsumerFactory<V, Element> {
        if (k._rdiKey) {
            return this.source(k, context)
        } else if (k.statuses) {
            return this.status(k, context)
        } else if (k._rdiJsx) {
            return this.consumer(k, context)
        }

        return this.computed(k, context)
    }
}
