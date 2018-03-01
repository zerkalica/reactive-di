// @flow
import type {TypedPropertyDescriptor} from './interfaces'
import type {IReaction} from './reactivity/interfaces'
import Injector from './Injector'
import type {IAtomize, IFromError, IRenderFn, IReactComponent, IProvideItem, IArg, IPropsWithContext} from './interfaces'

function setFunctionName(fn: Function, name: string) {
    Object.defineProperty(fn, 'name', {value: name, writable: false})
    fn.displayName = name
}

export default function createReactWrapper<IElement>(
    BaseComponent: Class<*>,
    ErrorComponent: IFromError<IElement>,
    Reaction: Class<IReaction<any>>,
    rootInjector?: Injector = new Injector(),
    isFullEqual?: boolean = false
): IAtomize<IElement, *> {
    class AtomizedComponent<State> extends BaseComponent {
        props: IPropsWithContext
        static displayName: string
        _injector: Injector

        static render: IRenderFn<IElement, State>
        static instance: number
        static isFullEqual = isFullEqual

        _render: IRenderFn<IElement, State>
        _reaction: IReaction<any>

        constructor(
            props: IPropsWithContext,
            reactContext?: Object
        ) {
            super(props, reactContext)
            let injector: Injector = rootInjector
            const cns = this.constructor
            let name = cns.displayName
            if (props) {
                if (props.__lom_ctx !== undefined) injector = props.__lom_ctx
                if (props.id) name = props.id
            }
            this._render = cns.render
            this._injector = injector.copy(cns)
            this._injector.id = name
            this._injector.props = props
            cns.instance++
            this._reaction = new Reaction(name, this)
        }

        toString() {
            return this._injector.toString()
        }

        // get displayName() {
        //     return this.toString()
        // }
        //

        shouldComponentUpdate(props: IPropsWithContext) {
            const oldProps = this.props
            this._injector.props = props
            let count = 0
            for (let k in oldProps) {
                count++
                if (oldProps[k] !== props[k]) {
                    this._reaction.reset()
                    return true
                }
            }
            for (let k in props) {
                count--
                if (oldProps[k] !== props[k]) {
                    this._reaction.reset()
                    return true
                }
            }
            if (count !== 0) {
                this._reaction.reset()
                return true
            }
            return false
        }

        componentWillUnmount() {
            this._reaction.destructor()
            this.props = (undefined: any)
            this._lastData = null
            if (this._render !== undefined) {
                this.constructor.instance--
                this._injector.destructor()
                this._injector = (undefined: any)
            }
        }

        _lastData: ?IElement = null

        value(propsChanged: boolean): ?IElement {
            let data: ?IElement = null
            const prevContext = Injector.parentContext
            const injector = Injector.parentContext = this._injector
            try {
                data = injector.invokeWithProps(this._render, this.props, propsChanged)
                this._lastData = data
            } catch (error) {
                data = injector.invokeWithProps(this._render.onError || ErrorComponent, {error, children: this._lastData})
            }
            Injector.parentContext = prevContext

            return data
        }

        render() {
            return this._reaction.value()
        }
    }

    const names: Map<string, number> = new Map()

    return function reactWrapper<State>(
        render: IRenderFn<IElement, State>
    ): Class<IReactComponent<IElement>> {
        const WrappedComponent = function(props: IPropsWithContext, context?: Object) {
            AtomizedComponent.call(this, props, context)
        }
        WrappedComponent.instance = 0
        WrappedComponent.render = render
        WrappedComponent.isFullEqual = render.isFullEqual || isFullEqual
        WrappedComponent.isDynamic = false
        WrappedComponent.aliases = render.aliases
        WrappedComponent.prototype = Object.create(AtomizedComponent.prototype)
        WrappedComponent.prototype.constructor = WrappedComponent
        let name = render.displayName || render.name
        let id = names.get(name) || 0
        names.set(name, id + 1)
        if (id > 0) name = `${name}_${id}`

        setFunctionName(WrappedComponent, name)
        return (WrappedComponent: any)
    }
}
