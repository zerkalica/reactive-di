// @flow

import type {IContext} from '../commonInterfaces'

import type {IMaster, IRelationBinder, IRelationHook, IConsumer, IComponentUpdater} from '../source/interfaces'

import resolveArgs from '../computed/resolveArgs'
import type {IGetable, IArg} from '../computed/resolveArgs'

import DisposableCollection from '../utils/DisposableCollection'
import type {IDisposableCollection} from '../utils/DisposableCollection'

import ConsumerProps from './ConsumerProps'
import type {IHasActualize, IConsumerState} from './ConsumerProps'

import type {
    IComponent,
    IConsumerProps,
    IConsumerMeta
} from './interfaces'

const emptyArgs: any = [null]

let listenerId = 0

export default class ConsumerState<
    Props: Object,
    State: Object,
    Element
> implements IConsumer, IConsumerState<State> {
    t: 1 = 1
    displayName: string
    id: number
    closed: boolean = false
    cached: ?State = null
    masters: IMaster[] = []
    hooks: IRelationHook[] = []
    listeners: IDisposableCollection<IHasActualize> = new DisposableCollection()

    _refs: number = 0
    _args: ?IArg[] = null
    _argVals: [State] = emptyArgs
    _proto: IGetable<IComponent<Props, State, Element>> = (null: any)
    _context: IContext
    _meta: IConsumerMeta

    constructor(
        meta: IConsumerMeta,
        context: IContext
    ) {
        this.displayName = meta.name
        this.id = meta.id
        this._meta = meta
        this._context = context
    }

    resolve(binder: IRelationBinder): this {
        const context = this._context
        const meta = this._meta

        binder.consumer = this
        this._proto = context.protoFactory
            ? context.protoFactory.resolveSource(meta.key)
            : ({cached: meta.key}: Object)

        this._args = meta.args ? context.resolveDeps(meta.args) : null
        if (this._args) {
            this._argVals = (new Array(this._args.length): any)
        }
        binder.consumer = null

        return this
    }

    create(parentId: number): IConsumerProps<Props, Element> {
        return new ConsumerProps(
            this._meta,
            this,
            this._context,
            this._proto,
            ++listenerId,
            !!this.hooks.length,
            parentId
        )
    }

    actualize(updaters: IComponentUpdater<*>[]) {
        this.cached = this._argVals[0]
        if (!this._args || resolveArgs(this._args, (this._argVals: any))) {
            const listeners = this.listeners.items
            for (let i = 0, l = listeners.length; i < l; i++) {
                const listener = listeners[i]
                if (!listener.closed) {
                    listener.actualize(updaters)
                }
            }
        }
    }

    get(): State {
        if (this._args) {
            resolveArgs(this._args, (this._argVals: any))
        }
        this.cached = this._argVals[0]

        return this.cached
    }

    willUnmount(): void {
        this._refs--
        if (this._refs !== 0) {
            return
        }

        if (this._meta.register) {
            this.listeners.gc()
            this._args = (null: any)
            this._argVals = emptyArgs
            this.hooks = []
            this.cached = this._argVals[0]
            this.closed = true
            this._context.dispose()
        } else {
            this.listeners.gc()
            const hooks = this.hooks
            for (let i = 0, l = hooks.length; i < l; i++) {
                const hook = hooks[i]
                hook.refs--
                if (!hook.refs) {
                    hook.reap()
                }
            }
        }
    }

    willMount(): void {
        if (this._refs === 0) {
            const hooks = this.hooks
            for (let i = 0, l = hooks.length; i < l; i++) {
                hooks[i].refs++
            }
        }

        this._refs++
    }
}
