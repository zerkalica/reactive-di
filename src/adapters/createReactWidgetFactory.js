// @flow
import type {
    CreateWidget,
    SrcComponent,
    CreateControllable,
    IComponentControllable,
    CreateElement,
    SetState
} from 'reactive-di/interfaces/component'

import debugName from 'reactive-di/utils/debugName'
import shallowEqual from 'reactive-di/utils/shallowEqual'

type ReactElement = React$Element<any>
type ReactComponent<Props, State> = React$Component<*, Props, State>
type ReactComponentClass<Props, State> = Class<ReactComponent<Props, State>>

type ReactCreateElement = CreateElement<any, ReactElement>
type CreateReactControllable<Props, State> = CreateControllable<State, ReactComponentClass<Props, State>>
type CreateReactWidget<Props, State> = CreateWidget<Props, State, ReactComponentClass<Props, State>>

interface StaticContext<Props, State> {
    target: SrcComponent<Props, State>;
    createControllable: CreateReactControllable<Props, State>;
    createElement: ReactCreateElement;
    isReact(tag: Function|string): boolean;
}

const dp = Object.defineProperty

class ComponentMixin<State: Object, Props: Object> {
    static __rdiCtx: StaticContext<Props, State>
    setState: (state: State) => void

    state: State
    props: Props

    _target: SrcComponent<Props, State>
    _controllable: IComponentControllable<State, ReactComponentClass<Props, State>>
    _createElement: ReactCreateElement

    componentWillMount(): void {
        const ctx: StaticContext<Props, State> = this.constructor.__rdiCtx
        const setState: SetState<State> = (state: State) => this.setState(state)
        const controllable = this._controllable = ctx.createControllable(setState, this)
        this._createElement = function createWrappedElement(
            tag: Function,
            props?: ?{[id: string]: mixed},
            ...children: any
        ): ReactElement {
            return ctx.createElement(
                ctx.isReact(tag) ? tag : controllable.wrapComponent(tag),
                props,
                children
            )
        }

        const state: ?State = controllable.getState()
        if (state) {
            this.state = state
        }
        this._target = ctx.target
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
            throw e
        }
    }
}

const dummyProps = {
    render() {}
}

interface React {
    Component: ReactComponentClass<*, *>;
    createClass(options: Object): ReactComponentClass<*, *>;
    createElement: Function;
}

export default function createReactWidgetFactory<Props: Object, State: Object> (
    {Component, createClass, createElement}: React
): CreateReactWidget<Props, State> {
    const RCProto = Component.prototype
    const RClassProto = createClass(dummyProps).prototype

    function isReact(tag: Function|string): boolean {
        return !tag.prototype
            || (RCProto: Object).isPrototypeOf(tag.prototype)
            && RClassProto === (tag: any).prototype
    }

    const assign = Object.assign

    return function createReactWidgetImpl(
        target: SrcComponent<Props, State>,
        createControllable: CreateReactControllable<Props, State>
    ): ReactComponentClass<Props, State> {
        class WrappedComponent extends (Component: any)<Props, State> {
            static displayName: string = `${debugName(target)}`
            static __rdiCtx: StaticContext<Props, State> = {
                target,
                createControllable,
                createElement,
                isReact
            }
            state: State
            props: Props
        }
        assign((WrappedComponent.prototype: Object), ComponentMixin.prototype)
        return WrappedComponent
    }
}
