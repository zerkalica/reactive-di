// @flow
import type {
    CreateWidget,
    SrcComponent,
    CreateControllable,
    IComponentControllable,
    GetComponent,
    CreateElement
} from 'reactive-di/interfaces/component'

import debugName from 'reactive-di/utils/debugName'
import shallowEqual from 'reactive-di/utils/shallowEqual'

type ReactElement = React$Element<any>
type ReactComponent<Props, State> = React$Component<*, Props, State>

type ReactCreateElement = CreateElement<any, ReactElement>

interface StaticContext<Props, State> {
    Target: Class<SrcComponent<Props, State>>;
    createControllable: CreateControllable<State>;
    createElement: ReactCreateElement;
    isReactClass: (tag: Function) => boolean;
}

const dp = Object.defineProperty

class ComponentMixin<State: Object, Props: Object> {
    static __rdiCtx: StaticContext<Props, State>
    setState: (state: State) => void

    state: State
    props: Props
    _target: SrcComponent<Props, State>
    _controllable: IComponentControllable<State>
    _createElement: ReactCreateElement

    componentWillMount(): void {
        const ctx = this.constructor.__rdiCtx
        const setState: (state: State) => void = (state: State) => this.setState(state)
        const controllable  = this._controllable = ctx.createControllable(setState, this)
        this._createElement = function createWrappedElement(
            tag: Function,
            props?: ?{[id: string]: mixed},
            ...children: any
        ): any {
            return ctx.createElement(
                ctx.isReactClass(tag) ? tag : controllable.wrapElement(tag),
                props,
                children
            )
        }

        const state: ?State = controllable.getState()
        if (state) {
            this.state = state
        }
        this._target = ctx.Target
    }

    componentDidMount() {
        this._controllable.onMount()
    }

    componentDidUpdate(props: Props, state: State): void {
        this._controllable.onUpdate()
    }

    componentWillUnmount(): void {
        this._controllable.onUnmount()
    }

    shouldComponentUpdate(nextProps: Object): boolean {
        return !shallowEqual(this.props, nextProps)
    }

    render(): any {
        try {
            return this._target(this.props, this.state, this._createElement)
        } catch (e) {
            console.error(e)
        }
    }
}

const dummyProps = {
    render() {}
}

export default function createReactWidgetFactory<Props:  Object, State: Object> (
    react: any
): CreateWidget<Props, State, Class<ReactComponent<Props, State>>> {
    const {Component, createClass, createElement} = react
    const RCProto = Component.prototype
    const RClassProto = createClass(dummyProps).prototype
    function isReactClass(tag: Function): boolean {
        return !tag.prototype
            || (RCProto: Object).isPrototypeOf(tag.prototype)
            && RClassProto === tag.prototype
    }
    const assign = Object.assign

    return function createReactWidgetImpl(
        Target: Class<SrcComponent<Props, State>>,
        createControllable: CreateControllable<State>
    ): Class<ReactComponent<Props, State>> {
        class WrappedComponent extends Component {
            static displayName: string = `${debugName(Target)}`
            static __rdiCtx: StaticContext<Props, State> = {
                Target,
                createControllable,
                createElement,
                isReactClass
            }
            state: State
            props: Props
        }
        assign((WrappedComponent.prototype: Object), ComponentMixin.prototype)
        return WrappedComponent
    }
}
