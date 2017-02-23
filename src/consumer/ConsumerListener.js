// @flow

import type {
    ICreateElement,
    ISetProps,
    IHasCreateComponent,
    IConsumerListener,
    IConsumerMeta,
    IComponent
} from './interfaces'

import Hook from '../hook/Hook'
import type {IHasForceUpdate, IHook} from '../hook/interfaces'

import type {
    IContext
} from '../commonInterfaces'

import type {IGetable} from '../utils/resolveArgs'
import {fakeListener, itemKey} from '../utils/IndexCollection'
import type {ItemListener} from '../utils/IndexCollection'

interface IParent<Props, State> {
    displayName: string;
    cached: ?State;

    pull(): any;
    willMount(): void;
    willUnmount(): void;
}

export default class ConsumerListener<
    Props: Object,
    State: Object,
    Element
> {
    displayName: string
    updater: ISetProps<Props>
    closed: boolean

    cached: ?Props

    _meta: IConsumerMeta

    _context: IContext
    _hook: ?IHook<Props>

    _parent: IParent<Props, State>
    _lastState: ?State

    _createElement: ICreateElement<Element>
    _lastError: ?Error
    _proto: IGetable<IComponent<Props, State, Element>>

    _items: Object[]

    constructor(
        meta: IConsumerMeta,
        updater: ISetProps<Props>,
        parent: IParent<Props, State>,
        context: IContext,
        proto: IGetable<IComponent<Props, State, Element>>,
        id: number
    ) {
        ;(this: IConsumerListener<Props, Element>) // eslint-disable-line
        this._meta = meta
        this.updater = updater
        this.displayName = meta.name + id
        this.closed = false
        this._items = context.items
        this._lastState = null
        this._lastError = null
        this.cached = (null: any)
        this._hook = meta.hook
            ? new Hook(meta.hook, context, this)
            : null
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
        const hook = this._hook
        try {
            if (hook && oldProps) {
                hook.shouldUpdate(props, oldProps)
            }
        } catch (e) {
            this._setError(e)
        }
    }

    pull(): ?IHasForceUpdate {
        return this.updater
    }

    update<V>(newItem: V): void {
        const oldProps = this.cached
        const newProps = {...oldProps, item: newItem}
        if (this.shouldUpdate(newProps)) {
            this._context.notifier.notify([this], this.displayName, oldProps, newProps)
            this.updater.setProps(newProps)
        }
    }

    shouldUpdate(props: Props): boolean {
        if (this._parent.cached !== this._lastState) {
            return true
        }

        const oldProps = this.cached

        if (oldProps === props) {
            return false
        }
        const hook = this._hook

        if ((!oldProps && props) || (!props && oldProps)) {
            this.cached = props
            if (hook) {
                this._willUpdate(props, oldProps)
            }
            return true
        }

        let lpKeys: number = 0
        for (let k in oldProps) { // eslint-disable-line
            if (oldProps[k] !== props[k]) {
                if (hook) {
                    this._willUpdate(props, oldProps)
                }
                this.cached = props
                return true
            }
            lpKeys++
        }
        for (let k in props) { // eslint-disable-line
            lpKeys--
        }
        if (lpKeys) {
            if (hook) {
                this._willUpdate(props, oldProps)
            }
            this.cached = props
            return true
        }

        return false
    }

    _renderError(): Element {
        const error = this._lastError || new Error('Unknown error')
        this._lastError = null
        if (!this._meta.errorComponent) {
            console.error('Can\'t render error: error component is not defined') // eslint-disable-line
            return (null: any)
        }

        return this.h(this._meta.errorComponent, {error})
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
        const parent = this._parent
        if (!parent.cached) {
            parent.pull()
            if (!parent.cached) {
                throw new Error(`${this._parent.displayName}.cached is null`)
            }
        }
        this._lastState = parent.cached
        try {
            return (this._proto.cached || this._proto.get())(
                (this.cached: any),
                (this._lastState: any),
                (this: IHasCreateComponent<Element>)
            )
        } catch (error) {
            this._setError(error)
            return this._renderError()
        }
    }

    willUnmount(): void {
        try {
            this.closed = true
            if (this._hook) {
                this._hook.willUnmount()
            }
            this._parent.willUnmount()
            const prop = (this.cached: any).item
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
        this.cached = props
        const prop = props.item
        if (prop && (prop: Object)[itemKey]) {
            (prop: Object)[itemKey].listener = (this: ItemListener<*>)
        }
        try {
            const hook = this._hook
            if (hook) {
                hook.resolve()
                hook.willMount()
            }
            this._parent.willMount()
        } catch (e) {
            this._setError(e)
        }
    }
}
