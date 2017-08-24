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
    __lom?: Class<IReactComponent<IElement>>;
    displayName?: string;
    deps?: IArg[];
    props?: Function;
    onError?: IFromError<IElement>;
}

type IFromError<IElement> = (props: {error: Error}, state?: any) => IElement

type IAtomize<IElement, State> = (
    render: IRenderFn<IElement, State>
) => Class<IReactComponent<IElement>>

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
        const isAtomic = typeof el === 'function' && el.constructor.render === undefined
        if (isAtomic) {
            if (el.__lom === undefined) {
                el.__lom = atomize(el)
            }
            newEl = el.__lom
            if (!attrs) {
                attrs = {__lom_ctx: parentContext}
            } else {
                // newEl.isKey = attrs.key !== undefined
                attrs.__lom_ctx = parentContext
            }
        } else {
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

const wrapperProxyDescr = {
    get(t: PropsWrapper<*>, name: string) {
        return t.writableProps[name]
    },
    ownKeys(t: PropsWrapper<*>) {
        return Object.keys(t.writableProps.valueOf())
    }
}

class PropsWrapper<Props: Object> {
    @mem writableProps: Props
    props: Props

    constructor(props: Props) {
        this.writableProps = props
        this.props = new Proxy((this: any), wrapperProxyDescr)
    }
}

export default function createReactWrapper<IElement>(
    BaseComponent: Class<*>,
    defaultFromError: IFromError<IElement>,
    rootInjector?: Injector = new Injector(),
    useContext?: boolean
): IAtomize<IElement, *> {
    class AtomizedComponent<State> extends BaseComponent {
        props: IPropsWithContext
        static displayName: string
        _propsChanged: boolean = true
        _injector: Injector
        _propsWrapper: PropsWrapper<IPropsWithContext> | void

        static render: IRenderFn<IElement, State>

        _keys: string[]

        constructor(
            props: IPropsWithContext,
            reactContext?: Object
        ) {
            super(props, reactContext)
            const render = this.constructor.render
            const injector: Injector = props.__lom_ctx || rootInjector
            this._keys = Object.keys(props)
            const propsKey = render.props
            if (props && propsKey !== undefined) {
                injector._map.set(propsKey, props)
                this._propsWrapper = new PropsWrapper(props)
                this._injector = (props.__lom_ctx || rootInjector).copy(
                    [[propsKey, this._propsWrapper.props]],
                    this.constructor.displayName
                )
            } else {
                this._propsWrapper = undefined
                this._injector = (props.__lom_ctx || rootInjector).copy(
                    undefined,
                    this.constructor.displayName
                )
            }
        }

        shouldComponentUpdate(props: IPropsWithContext) {
            const keys = this._keys
            const oldProps = this.props
            for (let i = 0; i < keys.length; i++) { // eslint-disable-line
                const k = keys[i]
                if (oldProps[k] !== props[k]) {
                    this._propsChanged = true
                    if (this._propsWrapper !== undefined) {
                        this._propsWrapper.writableProps = props
                    }
                    return true
                }
            }
            return false

            // this._propsChanged = shouldUpdate(this.props, props)
            // if (this._propsChanged && this._propsWrapper !== undefined) {
            //     this._propsWrapper.writableProps = props
            // }
            // return this._propsChanged
        }

        componentWillUnmount() {
            defaultContext.getAtom('r$', this).destroyed(true)
        }

        _destroy() {
            this._el = undefined
            this.props = (undefined: any)
            this._injector = (undefined: any)
            this._propsWrapper = undefined
        }

        _el: IElement | void = undefined

        @detached
        r(element?: IElement, force?: boolean): IElement {
            let data: IElement

            const render = this.constructor.render

            const prevContext = parentContext
            parentContext = this._injector

            const state = render.deps !== undefined
                ? this._injector.resolve(render.deps)[0]
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
        if (render.__lom !== undefined) {
            return render.__lom
        }

        const WrappedComponent = function(props: IPropsWithContext, context?: Object) {
            AtomizedComponent.call(this, props, context)
        }
        WrappedComponent.render = render
        // render.props = render.props || (render.deps ? render.deps[0] : undefined)
        WrappedComponent.displayName = render.displayName || render.name
        WrappedComponent.prototype = Object.create(AtomizedComponent.prototype)
        WrappedComponent.prototype.constructor = WrappedComponent

        return WrappedComponent
    }
}
