// @flow

import type {
    ICreateElement,
    IHasForceUpdate,
    IHasCreateComponent,
    IContext,
    IConsumerListener,
    IGetable,
    IConsumerHook
} from './interfaces'
import {fakeListener, itemKey} from '../utils/IndexCollection'
import type {ItemListener} from '../utils/IndexCollection'

interface IParent<State> {
    state: State;
    willMount(): void;
    willUnmount(updater: IHasForceUpdate): void;
}

export default class ConsumerListener<
    Props: any,
    State,
    Element,
    Component
> {
    displayName: string
    _updater: IHasForceUpdate
    closed: boolean
    cached: ?Props

    _context: IContext
    _props: Props
    _lastProps: ?Props
    _hook: IGetable<IConsumerHook<Props>>

    _parent: IParent<State>
    _lastState: ?State
    _createElement: ICreateElement<Element>
    _errorComponent: ?IConsumerListener<{error: Error}, Element, Component>
    _lastError: ?Error
    _proto: IGetable<Function>

    _items: Object[]

    constructor(
        displayName: string,
        updater: IHasForceUpdate,
        hook: IGetable<IConsumerHook<Props>>,
        parent: IParent<State>,
        proto: IGetable<Function>,
        errorComponent: ?IConsumerListener<{error: Error}, Element, Component>,
        context: IContext
    ) {
        this._updater = updater
        this.displayName = displayName
        this.closed = false
        this.cached = false
        this._items = context.items
        this._errorComponent = errorComponent
        this._lastState = null
        this._lastError = null
        this._props = (null: any)
        this._lastProps = null
        this._hook = hook
        this._parent = parent
        this._proto = proto
        this._context = context
        this._createElement = context.componentFactory.createElement
    }

    _setError(e: Error) {
        this._lastError = e
        this._context.errorHandler.setError(e)
    }

    _willUpdate(props: Props, oldProps: ?Props): void {
        const prop = props.item
        if (prop && (prop: Object)[itemKey]) {
            (prop: Object)[itemKey].listener = (this: ItemListener<*>)
        }

        try {
            (this._hook: any).willUpdate(props, oldProps)
        } catch (e) {
            this._setError(e)
        }
    }

    update<V>(newItem: V): void {
        this._props.item = newItem
        this._lastProps = null
        this._context.notifier.notify([this])
    }

    pull(): void {
        this._updater.forceUpdate()
    }

    shouldUpdate(props: Props): boolean {
        if (this._parent.state !== this._lastState) {
            return true
        }

        const oldProps = this._lastProps

        if (oldProps === props) {
            return false
        }

        if ((!oldProps && props) || (!props && oldProps)) {
            this._props = props
            return true
        }

        const hasReceiveProps = !!(this._hook.cached || this._hook.get()).willUpdate

        let lpKeys: number = 0
        for (let k in oldProps) { // eslint-disable-line
            if (oldProps[k] !== props[k]) {
                if (hasReceiveProps) {
                    this._willUpdate(props, oldProps)
                }
                this._props = props
                return true
            }
            lpKeys++
        }
        for (let k in props) { // eslint-disable-line
            lpKeys--
        }
        if (lpKeys) {
            if (hasReceiveProps) {
                this._willUpdate(props, oldProps)
            }
            this._props = props
            return true
        }

        return false
    }

    didMount(): void {
        try {
            const hook = this._hook.cached || this._hook.get()
            if (hook.didMount) {
                hook.didMount(this._props)
            }
        } catch (e) {
            this._setError(e)
        }
    }

    didUpdate(): void {
        try {
            const hook = this._hook.cached || this._hook.get()
            if (hook.didUpdate) {
                hook.didUpdate(this._props)
            }
        } catch (e) {
            this._setError(e)
        }
    }

    _renderError(): Element {
        const error = this._lastError || new Error('Unknown error')
        this._lastError = null
        const errorComponent = this._errorComponent
        if (!errorComponent) {
            console.error('Can\'t render error: error component is not defined') // eslint-disable-line
            throw error
        }
        errorComponent.shouldUpdate({error})
        return errorComponent.render()
    }

    h(
        tag: any,
        props?: ?{[id: string]: mixed}
    ): Element {
        let args: mixed[]

        const wrapped = typeof tag === 'function' && tag._rdiJsx
            ? ((this._items[tag._rdiId || 0]: any) || this._context.resolveConsumer(tag)).component
            : tag

        switch (arguments.length) {
            /* eslint-disable prefer-rest-params */
            case 2:
                return this._createElement(wrapped, props)
            case 3:
                return this._createElement(wrapped, props, arguments[2])
            case 4:
                return this._createElement(wrapped, props, arguments[2],
                    arguments[3]
                )
            case 5:
                return this._createElement(wrapped, props, arguments[2],
                arguments[3], arguments[4]
            )
            case 6:
                return this._createElement(wrapped, props, arguments[2],
                    arguments[3], arguments[4], arguments[5]
                )
            case 7:
                return this._createElement(wrapped, props, arguments[2],
                    arguments[3], arguments[4], arguments[5], arguments[6]
                )
            case 8:
                return this._createElement(wrapped, props, arguments[2],
                    arguments[3], arguments[4], arguments[5], arguments[6], arguments[7]
                )
            case 9:
                return this._createElement(wrapped, props, arguments[2],
                    arguments[3], arguments[4], arguments[5], arguments[6],
                    arguments[7], arguments[8]
                )
            default:
                args = [wrapped, props]
                for (let i = 2, l = arguments.length; i < l; i++) {
                    args.push(arguments[i])
                }
                return this._createElement(...args)
        }
    }

    render(): Element {
        if (this._lastError) {
            return this._renderError()
        }
        this._lastProps = this._props
        this._lastState = this._parent.state
        try {
            return (this._proto.cached || this._proto.get())(
                this._props,
                this._lastState,
                (this: IHasCreateComponent<Element>)
            )
        } catch (error) {
            this._setError(error)
            return this._renderError()
        }
    }

    willUnmount(): void {
        try {
            this._parent.willUnmount(this._updater)
            const hook = this._hook.cached || this._hook.get()
            if (hook.willUnmount) {
                hook.willUnmount(this._props)
            }
            const prop = this._props.item
            if (prop && (prop: Object)[itemKey]) {
                (prop: Object)[itemKey].listener = fakeListener
            }
        } catch (e) {
            this._setError(e)
        }
    }

    willMount(props: Props): void {
        this._props = props
        try {
            this._parent.willMount()
            const hook = this._hook.cached || this._hook.get()
            if (hook.willMount) {
                hook.willMount(this._props)
            }
        } catch (e) {
            this._setError(e)
        }
    }
}
