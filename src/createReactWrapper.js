// @flow
import type {TypedPropertyDescriptor} from './interfaces'

import Injector from './Injector'
import type {IAtomize, IFromError, IRenderFn, IReactComponent, IProvideItem, IArg, IPropsWithContext} from './interfaces'
import {rdiRendered} from './interfaces'

export default function createReactWrapper<IElement>(
    BaseComponent: Class<*>,
    ErrorComponent: IFromError<IElement>,
    detached: TypedPropertyDescriptor<(force?: boolean) => any>,
    rootInjector?: Injector = new Injector(),
    isFullEqual?: boolean = false
): IAtomize<IElement, *> {
    class AtomizedComponent<State> extends BaseComponent {
        props: IPropsWithContext
        static displayName: string
        _propsChanged: boolean = true
        _injector: Injector

        static render: IRenderFn<IElement, State>
        static instance: number
        static isFullEqual = isFullEqual

        _keys: string[] | void
        _render: IRenderFn<IElement, State>

        constructor(
            props: IPropsWithContext,
            reactContext?: Object
        ) {
            super(props, reactContext)
            let injector: Injector = rootInjector
            this._keys = undefined
            const cns = this.constructor
            let name = cns.displayName
            if (props) {
                this._keys = Object.keys(props)
                if (this._keys.length === 0) this._keys = (undefined: any)
                if (props.__lom_ctx !== undefined) injector = props.__lom_ctx
                if (props.id) name = props.id
            }
            this._render = cns.render
            this._injector = injector.copy(
                cns.displayName,
                cns.instance,
                this._render.aliases
            )
            this._injector.id = name
            this._injector.props = props
            cns.instance++
        }

        toString() {
            return this._injector.toString()
        }

        get displayName() {
            return this.toString()
        }

        shouldComponentUpdate(props: IPropsWithContext) {
            if (this._keys === undefined) return false
            const oldProps = this.props
            const keys = this._keys
            this._injector.props = props
            for (let i = 0, l = keys.length; i < l; i++) { // eslint-disable-line
                const k = keys[i]
                if (oldProps[k] !== props[k]) {
                    this._propsChanged = true
                    return true
                }
            }
            if (this.constructor.isFullEqual === true) {
                this._keys = Object.keys(props)
                this._propsChanged = keys.length !== this._keys.length
                return this._propsChanged
            }
            return false
        }

        componentWillUnmount() {
            this['r()'].destructor()
            this._el = undefined
            this._keys = undefined
            this.props = (undefined: any)
            this._lastData = null
            if (this._render !== undefined) {
                this.constructor.instance--
                this._injector.destructor()
                this._injector = (undefined: any)
            }
        }

        _el: ?(IElement | void) = undefined
        _lastData: ?IElement = null
        @detached r(force: boolean): ?IElement {
            let data: ?IElement = null

            const render = this._render

            const prevContext = Injector.parentContext
            const injector = Injector.parentContext = this._injector
            try {
                data = injector.invokeWithProps(render, this.props, this._propsChanged)
                this._lastData = data
            } catch (error) {
                data = injector.invokeWithProps(render.onError || ErrorComponent, {error, children: this._lastData})
                error[rdiRendered] = true
            }
            Injector.parentContext = prevContext

            if (!this._propsChanged) {
                this._el = data
                this.forceUpdate()
                this._el = undefined
            }
            this._propsChanged = false

            return data
        }

        render() {
            return this._el === undefined
                ? this.r(this._propsChanged)
                : this._el
        }
    }

    return function reactWrapper<State>(
        render: IRenderFn<IElement, State>
    ): Class<IReactComponent<IElement>> {
        const WrappedComponent = function(props: IPropsWithContext, context?: Object) {
            AtomizedComponent.call(this, props, context)
        }
        WrappedComponent.instance = 0
        WrappedComponent.render = render
        WrappedComponent.isFullEqual = render.isFullEqual || isFullEqual
        WrappedComponent.displayName = render.displayName || render.name
        WrappedComponent.prototype = Object.create(AtomizedComponent.prototype)
        WrappedComponent.prototype.constructor = WrappedComponent

        return WrappedComponent
    }
}
