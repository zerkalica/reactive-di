// @flow

import type {
    IConsumerProps,
    IRawComponent,
    IConsumerMeta,
    IComponent
} from './interfaces'

import type {IGetable, IComponentUpdater, ISource, INotifier} from '../source/interfaces'
import type {IContext} from '../commonInterfaces'

import type {IDisposableCollection} from '../utils/DisposableCollection'

export interface IHasActualize {
    closed: boolean;
    actualize(updaters: IComponentUpdater<*>[]): void;
}

export interface IConsumerState<State> {
    cached: ?State;
    get(): State;
    willUnmount(): void;
    willMount(): void;
    listeners: IDisposableCollection<IHasActualize>;
}

export default class ConsumerProps<
    Props: Object,
    State: Object,
    Element
> implements IHasActualize, IComponentUpdater<Props>, IConsumerProps<Props, Element> {
    id: number
    displayName: string
    closed: boolean = false
    hasHooks: boolean
    parentId: number

    props: Props = (null: any)

    _rendering: boolean = false

    cached: ?Element = null
    _updater: IRawComponent<Props> = (null: any)
    _notifier: INotifier
    _meta: IConsumerMeta
    _context: IContext
    _state: IConsumerState<State>
    _proto: IGetable<IComponent<Props, State, Element>>
    _propsModel: ?ISource<Props, Props> = null
    _oldState: ?State = null

    constructor(
        meta: IConsumerMeta,
        state: IConsumerState<State>,
        context: IContext,
        proto: IGetable<IComponent<Props, State, Element>>,
        id: number,
        hasHooks: boolean,
        parentId: number
    ) {
        this.parentId = parentId
        this._meta = meta
        this.hasHooks = hasHooks
        this.id = id
        this.displayName = meta.name
        this._state = state
        this._proto = proto
        this._context = context
        this._notifier = context.notifier
    }

    _setError(e: Error) {
        this._notifier.error(this.displayName, e)
    }

    onComponentShouldUpdate(props: Props): boolean {
        if (this._state.cached !== this._oldState) {
            this._oldState = this._state.cached
            this.props = props
            this.cached = null
            return true
        }

        const oldProps = this.props

        if (oldProps === props) {
            return false
        }
        const propsModel = this._propsModel

        if ((!oldProps && props) || (!props && oldProps)) {
            this.props = props
            if (propsModel) {
                propsModel.set(props)
            }
            this.cached = null
            return true
        }

        let lpKeys: number = 0
        for (let k in oldProps) { // eslint-disable-line
            if (oldProps[k] !== props[k]) {
                if (propsModel) {
                    propsModel.set(props)
                }
                this.props = props
                this.cached = null
                return true
            }
            lpKeys++
        }
        for (let k in props) { // eslint-disable-line
            lpKeys--
        }
        if (lpKeys) {
            if (propsModel) {
                propsModel.set(props)
            }
            this.props = props
            this.cached = null
            return true
        }

        return false
    }

    actualize(updaters: IComponentUpdater<*>[]) {
        if (this._rendering) {
            return
        }
        updaters.push(this)
        this.cached = null
        this.render()
    }

    forceUpdate() {
        this._updater.forceUpdate()
    }

    init(rc: IRawComponent<Props>, props: Props): void {
        this._updater = rc
        this._state.listeners.push(this)
        this.props = props
        if (this._meta.propsTo) {
            this._propsModel = this._context.resolveSource(this._meta.propsTo)
            this._propsModel.set(props)
        }
    }

    render(): ?Element {
        if (this.cached) {
            return this.cached
        }

        this._notifier.parentId = this.id

        if (this._meta.propsTo && !this._propsModel) {
            const propsModel = this._propsModel = this._context.resolveSource(this._meta.propsTo)
            propsModel.set(this.props)
        }

        this._rendering = true
        try {
            this.cached = (this._proto.cached || this._proto.get())(
                this.props,
                this._state.cached || this._state.get(),
                this._context
            )
        } catch (error) {
            this._setError(error)
        }
        this._rendering = false

        return this.cached
    }

    onComponentWillUnmount() {
        try {
            this.closed = true
            this._state.willUnmount()
        } catch (e) {
            this._setError(e)
        }
    }

    onComponentWillMount() {
        try {
            this._state.willMount()
        } catch (e) {
            this._setError(e)
        }
    }
}
