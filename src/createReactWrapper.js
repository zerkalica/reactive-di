// @flow
import {defaultContext, mem, detached} from 'lom_atom'
import type {NamesOf} from 'lom_atom'

import Injector from './Injector'
import type {IProcessor, ISheet, IProvideItem, IArg, IPropsWithContext} from './Injector'

type IReactComponent<IElement> = {
    constructor(props: IPropsWithContext, context?: Object): IReactComponent<IElement>;
    render(): IElement;
    forceUpdate(): void;
}

interface IRenderFn<IElement, State> {
    (props: IPropsWithContext, state?: State): IElement;

    displayName?: string;
    deps?: IArg[];
    props?: Function;
    onError?: IFromError<IElement>;
}

type IFromError<IElement> = (props: {error: Error}, state?: any) => IElement

type IAtomize<IElement, State> = (
    render: IRenderFn<IElement, State>
) => Class<IReactComponent<IElement>>

function createEventFix(origin: (e: Event) => void): (e: Event) => void {
    function fixEvent(e: Event) {
        origin(e)
        defaultContext.run()
    }
    fixEvent.displayName = origin.displayName || origin.name

    return fixEvent
}

function shouldUpdate<Props: Object>(oldProps: Props, props: Props): boolean {
    if (oldProps === props) {
        return false
    }
    if ((!oldProps && props) || (!props && oldProps)) {
        return true
    }

    let lpKeys = 0
    for (let k in oldProps) { // eslint-disable-line
        if (oldProps[k] !== props[k]) {
            return true
        }
        lpKeys++
    }
    for (let k in props) { // eslint-disable-line
        lpKeys--
    }

    return lpKeys !== 0
}

let parentContext: Injector | void = undefined

export function createCreateElement<IElement, State>(
    atomize: IAtomize<IElement, State>,
    createElement: Function
) {
    return function lomCreateElement() {
        const el = arguments[0]
        let attrs = arguments[1]

        let newEl
        const isAtomic = typeof el === 'function' && el.prototype.render === undefined
        if (isAtomic) {
            if (el.__lom === undefined) {
                el.__lom = atomize(el)
            }
            newEl = el.__lom
            if (!attrs) {
                attrs = {__lom_ctx: parentContext}
            } else {
                attrs.__lom_ctx = parentContext
            }
        } else {
            newEl = el
        }
        if (attrs) {
            if (attrs.onKeyPress) {
                attrs.onKeyPress = createEventFix(attrs.onKeyPress)
            }
            if (attrs.onKeyDown) {
                attrs.onKeyDown = createEventFix(attrs.onKeyDown)
            }
            if (attrs.onKeyUp) {
                attrs.onKeyUp = createEventFix(attrs.onKeyUp)
            }
            if (attrs.onInput) {
                attrs.onChange = createEventFix(attrs.onInput)
            }
            if (attrs.onChange) {
                attrs.onChange = createEventFix(attrs.onChange)
            }
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
    rootInjector?: Injector = new Injector(),
): IAtomize<IElement, *> {
    class AtomizedComponent<State> extends BaseComponent {
        _render: IRenderFn<IElement, State>

        props: IPropsWithContext

        static instances: number
        _propsChanged: boolean = true
        _injector: Injector | void = undefined
        sheet: ISheet<*> | void = undefined

        constructor(
            props: IPropsWithContext,
            reactContext?: Object,
            render: IRenderFn<IElement, State>
        ) {
            super(props, reactContext)
            this._render = render
            if (render.deps !== undefined || render.props !== undefined) {
                this.constructor.instances++
            }
        }

        shouldComponentUpdate(props: IPropsWithContext) {
            this._propsChanged = shouldUpdate(this.props, props)
            return this._propsChanged
        }

        componentWillUnmount() {
            defaultContext.getAtom(this, this.r, 'r').destroyed(true)
        }

        _destroy() {
            const render = this._render
            if (render.deps !== undefined || render.props !== undefined) {
                this.constructor.instances--
            }

            if (this.sheet !== undefined && this.constructor.instances === 0) {
                this.sheet.detach()
            }
            this.sheet = undefined
            this._el = undefined
            this.props = (undefined: any)
            this._injector = undefined
            this._render = (undefined: any)
        }

        _getInjector(): Injector {
            const parentInjector: Injector = this.props.__lom_ctx || rootInjector
            // Autodetect separate state per component instance
            this._injector = this.constructor.instances > 0
                ? parentInjector.copy()
                : parentInjector

            return this._injector
        }

        @mem
        _state(next?: State, force?: boolean): State {
            const injector = this._injector || this._getInjector()
            if (this._render.props && force) {
                injector.value(this._render.props, this.props, true)
            }
            const oldSheet = this.sheet
            const state = injector.resolve(this._render.deps, this)[0]

            if (oldSheet !== undefined && this.sheet !== oldSheet) {
                oldSheet.detach()
            }

            return state
        }

        _el: IElement | void = undefined

        @detached
        r(element?: IElement, force?: boolean): IElement {
            let data: IElement

            const render = this._render

            const prevContext = parentContext
            parentContext = this._injector || this._getInjector()

            const state = render.deps !== undefined
                ? this._state(undefined, force)
                : undefined

            try {
                data = render(this.props, state)
            } catch (error) {
                const onError = render.onError || defaultFromError
                data = onError(
                    {error},
                    onError.deps === undefined
                        ? undefined
                        : parentContext.resolve(onError.deps)[0]
                )
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
            return this._el === undefined
                ? this.r(undefined, this._propsChanged)
                : this._el
        }
    }

    return function reactWrapper<State>(
        render: IRenderFn<IElement, State>
    ): Class<IReactComponent<IElement>> {
        function WrappedComponent(props: IPropsWithContext, context?: Object) {
            AtomizedComponent.call(this, props, context, render)
        }
        WrappedComponent.instances = 0
        WrappedComponent.displayName = render.displayName || render.name
        WrappedComponent.prototype = Object.create(AtomizedComponent.prototype)
        WrappedComponent.prototype.constructor = WrappedComponent

        return WrappedComponent
    }
}
