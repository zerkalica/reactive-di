// @flow
import {mem, detached} from 'lom_atom'
import type {NamesOf} from 'lom_atom'

import Injector from './Injector'
import type {IProcessor, ISheet, IProvideItem, IArg, IPropsWithContext} from './Injector'

type IReactComponent<IElement> = {
    constructor(props: IPropsWithContext, context?: Object): IReactComponent<IElement>;
    render(): IElement;
    forceUpdate(): void;
}

export interface IRenderFn<IElement, State> {
    (props: IPropsWithContext, state?: State): IElement;
    __lom?: Class<IReactComponent<IElement>>;
    displayName?: string;
    deps?: IArg[];
    onError?: IFromError<IElement>;
    aliases?: IProvideItem[];
}

type IFromError<IElement> = (props: {error: Error}, state?: any) => IElement

type IAtomize<IElement, State> = (
    render: IRenderFn<IElement, State>
) => Class<IReactComponent<IElement>>

let parentContext: Injector | void = undefined

export function createCreateElement<IElement, State>(
    atomize: IAtomize<IElement, State>,
    createElement: Function
) {
    return function lomCreateElement() {
        let el = arguments[0]
        let attrs = arguments[1]
        let newEl
        const isAtomic = typeof el === 'function' && el.constructor.render === undefined
        const id = attrs ? attrs.id : undefined
        if (isAtomic) {
            if (!attrs) {
                attrs = {__lom_ctx: parentContext}
            } else {
                attrs.__lom_ctx = parentContext
            }
            if (parentContext !== undefined) {
                newEl = parentContext.alias(el, id)
                if (newEl === null) return null
                if (newEl !== undefined) el = newEl
            }

            if (el.__lom === undefined) {
                el.__lom = atomize(el)
            }
            newEl = el.__lom
        } else {
            if (parentContext !== undefined && id) {
                newEl = parentContext.alias(el, id)
                if (newEl === null) return null
                if (newEl !== undefined) el = newEl
            }
            newEl = el
        }

        switch(arguments.length) {
            case 2:
                return createElement(newEl, attrs)
            case 3:
                return createElement(newEl, attrs, arguments[2])
            case 4:
                return createElement(newEl, attrs, arguments[2], arguments[3])
            case 5:
                return createElement(newEl, attrs, arguments[2], arguments[3], arguments[4])
            case 6:
                return createElement(newEl, attrs, arguments[2], arguments[3], arguments[4], arguments[5])
            case 7:
                return createElement(newEl, attrs, arguments[2], arguments[3],
                    arguments[4], arguments[5], arguments[6])
            case 8:
                return createElement(newEl, attrs, arguments[2], arguments[3],
                    arguments[4], arguments[5], arguments[6], arguments[7])
            case 9:
                return createElement(newEl, attrs, arguments[2], arguments[3],
                    arguments[4], arguments[5], arguments[6], arguments[7], arguments[8])
            default:
                if (isAtomic === false) {
                    return createElement.apply(null, arguments)
                }
                const args = [newEl, attrs]
                for (let i = 2, l = arguments.length; i < l; i++) {
                    args.push(arguments[i])
                }
                return createElement.apply(null, args)
        }
    }
}

export default function createReactWrapper<IElement>(
    BaseComponent: Class<*>,
    defaultFromError: IFromError<IElement>,
    rootInjector?: Injector = new Injector()
): IAtomize<IElement, *> {
    class AtomizedComponent<State> extends BaseComponent {
        props: IPropsWithContext
        static displayName: string
        _propsChanged: boolean = true
        _injector: Injector

        static render: IRenderFn<IElement, State>
        static instance: number

        _keys: string[] | void
        _render: IRenderFn<IElement, State>

        constructor(
            props: IPropsWithContext,
            reactContext?: Object
        ) {
            super(props, reactContext)
            this._keys = props ? Object.keys(props) : undefined
            const cns = this.constructor
            const parentInjector = props.__lom_ctx || rootInjector
            this._render = cns.render
            const injectorName = cns.displayName + (cns.instance ? ('[' + cns.instance + ']') : '')
            this._injector = parentInjector.copy(
                this._render.aliases,
                injectorName,
                cns.instance
            )
            cns.instance++
        }

        toString() {
            return `${this._injector.displayName}.${this.constructor.displayName}`
        }

        get displayName() {
            return this.toString()
        }

        shouldComponentUpdate(props: IPropsWithContext) {
            const keys = this._keys
            if (!keys) return false
            const oldProps = this.props
            for (let i = 0, l = keys.length; i < l; i++) { // eslint-disable-line
                const k = keys[i]
                if (oldProps[k] !== props[k]) {
                    this._propsChanged = true
                    return true
                }
            }
            return false
        }

        componentWillUnmount() {
            this['r()'].destroyed(true)
        }

        destroy() {
            this._el = undefined
            this._keys = undefined
            this.props = (undefined: any)
            if (this._render !== undefined) {
                this.constructor.instance--
                this._injector.destroy()
                this._injector = (undefined: any)
            }
        }

        _el: ?(IElement | void) = undefined

        @detached
        r(element?: IElement, force?: boolean): IElement {
            let data: IElement

            const render = this._render

            const prevContext = parentContext
            parentContext = this._injector
            try {
                data = parentContext.invokeWithProps(render, this.props, force)
            } catch (error) {
                data = parentContext.invokeWithProps(render.onError || defaultFromError, {error})
            }
            parentContext = prevContext

            if (!force) {
                this._el = data
                this.forceUpdate()
                this._el = undefined
            }
            this._propsChanged = false

            return data
        }

        render() {
            return this._el === undefined ? this.r(undefined, this._propsChanged) : this._el
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
        WrappedComponent.displayName = render.displayName || render.name
        WrappedComponent.prototype = Object.create(AtomizedComponent.prototype)
        WrappedComponent.prototype.constructor = WrappedComponent

        return WrappedComponent
    }
}
