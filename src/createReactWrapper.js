// @flow
import {ATOM_FORCE_NONE, ATOM_FORCE_CACHE} from './interfaces'
import type {IAtomForce, DetachedDecorator} from './interfaces'

import Injector from './Injector'
import type {IAtomize, IFromError, IRenderFn, IReactComponent, IProvideItem, IArg, IPropsWithContext} from './interfaces'
import {renderedKey} from './interfaces'

export default function createReactWrapper<IElement>(
    BaseComponent: Class<*>,
    ErrorComponent: IFromError<IElement>,
    detached: DetachedDecorator<Object, any>,
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
            if (props) {
                this._keys = Object.keys(props)
                if (this._keys.length === 0) this._keys = (undefined: any)
                if (props.__lom_ctx !== undefined) injector = props.__lom_ctx
            }
            const cns = this.constructor
            this._render = cns.render
            this._injector = injector.copy(
                cns.displayName + (cns.instance ? ('[' + cns.instance + ']') : ''),
                cns.instance,
                this._render.aliases
            )
            cns.instance++
        }

        toString() {
            return this._injector.displayName
        }

        get displayName() {
            return this.toString()
        }

        shouldComponentUpdate(props: IPropsWithContext) {
            if (this._keys === undefined) return false
            const oldProps = this.props
            const keys = this._keys
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
            this._el = undefined
            this._keys = undefined
            this.props = (undefined: any)
            if (this._render !== undefined) {
                this.constructor.instance--
                this._injector.destructor()
                this._injector = (undefined: any)
            }
            this['r()'].destructor()
        }

        _el: ?(IElement | void) = undefined

        @detached r(element?: IElement, force?: IAtomForce): IElement {
            let data: IElement

            const render = this._render

            const prevContext = Injector.parentContext
            Injector.parentContext = this._injector
            try {
                data = this._injector.invokeWithProps(render, this.props, this._propsChanged)
            } catch (error) {
                data = this._injector.invokeWithProps(render.onError || ErrorComponent, {error})
                error[renderedKey] = true
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
                ? this.r(undefined, this._propsChanged ? ATOM_FORCE_CACHE : ATOM_FORCE_NONE)
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
