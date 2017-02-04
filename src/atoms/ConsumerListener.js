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

interface IParent<Props, State> {
    state: State;
    willMount(): void;
    willUnmount(updater: IHasForceUpdate<Props>): void;
}

export default class ConsumerListener<
    Props: any,
    State,
    Element,
    Component
> {
    displayName: string
    _updater: IHasForceUpdate<Props>
    closed: boolean
    cached: ?Props
    props: Props

    _context: IContext
    _lastProps: ?Props
    _hook: IGetable<IConsumerHook<Props>>

    _parent: IParent<Props, State>
    _lastState: ?State
    _createElement: ICreateElement<Element>
    _errorComponent: ?IConsumerListener<{error: Error}, Element, Component>
    _lastError: ?Error
    _proto: IGetable<Function>

    _items: Object[]
    _trace: string

    constructor(
        displayName: string,
        updater: IHasForceUpdate<Props>,
        hook: IGetable<IConsumerHook<Props>>,
        parent: IParent<Props, State>,
        proto: IGetable<Function>,
        errorComponent: ?IConsumerListener<{error: Error}, Element, Component>,
        context: IContext,
        id: number
    ) {
        ;(this: IConsumerListener<Props, Element, Component>) // eslint-disable-line
        this._updater = updater
        this.displayName = displayName
        this.closed = false
        this.cached = null
        this._trace = this.displayName + '' + id
        this._items = context.items
        this._errorComponent = errorComponent
        this._lastState = parent.state
        this._lastError = null
        this.props = (null: any)
        this._lastProps = null
        this._hook = hook
        this._parent = parent
        this._proto = proto
        this._context = context
        this._createElement = context.componentFactory.createElement
    }

    _setError(e: Error) {
        this._lastError = e
        this._context.notifier.onError(e, this.displayName)
    }

    _willUpdate(props: Props, oldProps: ?Props): void {
        const prop = props.item
        if (prop && (prop: Object)[itemKey]) {
            (prop: Object)[itemKey].listener = (this: ItemListener<*>)
        }
        const hook: any = this._hook
        try {
            (hook.cached || hook.get()).willUpdate(props, oldProps)
        } catch (e) {
            this._setError(e)
        }
    }

    update<V>(newItem: V): void {
        this._lastProps = null
        // this._lastState = null
        const newProps = {...this.props, item: newItem}
        if (this.shouldUpdate(newProps)) {
            this._context.notifier.notify([this], this.displayName, this.props, newProps)
            this._updater.setProps(this.props)
        }
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
        const hasReceiveProps = !!(this._hook.cached || this._hook.get()).willUpdate

        if ((!oldProps && props) || (!props && oldProps)) {
            this.props = props
            if (hasReceiveProps) {
                this._willUpdate(props, oldProps)
            }
            return true
        }


        let lpKeys: number = 0
        for (let k in oldProps) { // eslint-disable-line
            if (oldProps[k] !== props[k]) {
                if (hasReceiveProps) {
                    this._willUpdate(props, oldProps)
                }
                this.props = props
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
            this.props = props
            return true
        }

        return false
    }

    didMount(): void {
        try {
            const hook = this._hook.cached || this._hook.get()
            if (hook.didMount) {
                hook.didMount(this.props)
            }
        } catch (e) {
            this._setError(e)
        }
    }

    didUpdate(): void {
        try {
            const hook = this._hook.cached || this._hook.get()
            if (hook.didUpdate) {
                hook.didUpdate(this.props)
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
            // throw error
            return (null: any)
        }
        errorComponent.props = {error}
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
        this._lastProps = this.props
        this._lastState = this._parent.state
        try {
            const notifier = this._context.notifier
            const oldTrace = notifier.trace
            notifier.trace = this._trace
            const result = (this._proto.cached || this._proto.get())(
                this.props,
                this._lastState,
                (this: IHasCreateComponent<Element>)
            )
            notifier.trace = oldTrace
            return result
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
                hook.willUnmount(this.props)
            }
            const prop = this.props.item
            if (prop) {
                const p = (prop: Object)[itemKey]
                if (p && p.listener === this) {
                    p.listener = fakeListener
                }
            }
        } catch (e) {
            this._setError(e)
        }
    }

    willMount(props: Props): void {
        this.props = props
        const prop = props.item
        if (prop && (prop: Object)[itemKey]) {
            (prop: Object)[itemKey].listener = (this: ItemListener<*>)
        }
        try {
            this._parent.willMount()
            const hook = this._hook.cached || this._hook.get()
            if (hook.willMount) {
                hook.willMount(this.props)
            }
        } catch (e) {
            this._setError(e)
        }
    }
}
