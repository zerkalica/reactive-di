// @flow

import type {IContext} from '../commonInterfaces'

import type {IHasForceUpdate, IHook} from '../hook/interfaces'

import resolveArgs from '../utils/resolveArgs'
import type {IGetable, IArg} from '../utils/resolveArgs'
import DisposableCollection from '../utils/DisposableCollection'
import type {IDisposableCollection} from '../utils/DisposableCollection'

import ConsumerListener from './ConsumerListener'

import type {
    IConsumer,
    ISetProps,
    IComponent,
    IConsumerListener,
    IConsumerMeta
} from './interfaces'

const emptyArgs: any = [{}]

export default class ConsumerCollection<
    Props: Object,
    State: Object,
    Element
> {
    t: 2
    displayName: string
    id: number
    closed: boolean
    cached: ?State

    hooks: IHook<*>[]

    _listenerId: number = 0
    _resolved: boolean
    _refs: number
    _args: ?IArg[]
    _argVals: [State]

    _proto: IGetable<IComponent<Props, State, Element>>
    _listeners: IDisposableCollection<IConsumerListener<Props, Element>>
    _isOwnContext: boolean
    _context: IContext

    _meta: IConsumerMeta

    constructor(
        meta: IConsumerMeta,
        context: IContext
    ) {
        (this: IConsumer<State>) // eslint-disable-line
        this.displayName = meta.name
        this.id = meta.id
        this._meta = meta

        this.t = 2
        this._refs = 0
        this.closed = false
        this._resolved = false
        this.hooks = []
        this._listeners = new DisposableCollection()

        this._isOwnContext = !!meta.register
        this._args = (null: any)
        this._argVals = emptyArgs
        this.cached = this._argVals[0]

        this._context = context
    }

    create(updater: ISetProps<Props>): IConsumerListener<Props, Element> {
        const meta = this._meta
        const context = this._context
        if (!this._resolved) {
            this._resolved = true
            context.binder.begin((this: IConsumer<State>), false)

            this._proto = context.protoFactory
                ? context.protoFactory.resolveSource(meta.key)
                : ({cached: meta.key}: Object)

            this._args = meta.args ? context.resolveDeps(meta.args) : null
            if (this._args) {
                this._argVals = (new Array(this._args.length): any)
                // resolveArgs(this._args, this._argVals)
                // this.cached = this._argVals[0]
            }
            context.binder.end()
        }

        const listener = new ConsumerListener(
            meta,
            updater,
            this,
            context,
            this._proto,
            ++this._listenerId
        )

        this._listeners.push(listener)

        return listener
    }

    pull(): ?IHasForceUpdate {
        try {
            this.cached = this._argVals[0]
            return (!this._args || resolveArgs(this._args, (this._argVals: any)))
                ? this
                : null
        } catch (e) {
            this._context.notifier.onError(e, this.displayName, !!this._meta.errorComponent)
            return null
        }
    }

    forceUpdate(): void {
        const listeners = this._listeners.items
        for (let i = 0, l = listeners.length; i < l; i++) {
            const listener = listeners[i]
            if (!listener.closed) {
                listener.updater.forceUpdate()
            }
        }
    }

    detach(): void {
        this._refs--
        if (this._refs === 0) {
            if (this._isOwnContext) {
                this._args = (null: any)
                this._argVals = emptyArgs
                this.hooks = []
                this.cached = this._argVals[0]
                this._listeners.gc()
                this.closed = true
                this._context.dispose()
            } else {
                const hooks = this.hooks
                for (let i = 0, l = hooks.length; i < l; i++) {
                    hooks[i].detach()
                }
            }
        }
    }

    willMount(): void {
        if (this._refs === 0) {
            if (this._args) {
                resolveArgs(this._args, (this._argVals: any))
            }
            this.cached = this._argVals[0]

            const hooks = this.hooks
            for (let i = 0, l = hooks.length; i < l; i++) {
                hooks[i].willMount()
            }
        }

        this._refs++
    }
}
