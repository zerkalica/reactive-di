// @flow
import type {
    ComponentFactory,
    CreateElement,
    SrcComponent,
    CreateControllable,
    IComponentControllable,
    SetState
} from 'reactive-di/interfaces/component'
import type {IContext} from 'reactive-di/interfaces/internal'
import debugName from 'reactive-di/utils/debugName'
import shallowEqual, {shallowStrictEqual} from 'reactive-di/utils/shallowEqual'

type ReactElement = React$Element<any>
type ReactComponent<Props, State> = React$Component<*, Props, State>
type ReactComponentClass<Props, State> = Class<ReactComponent<Props, State>>

type ReactCreateElement = CreateElement<any, ReactElement>
type CreateReactControllable<Props, State> = CreateControllable<State, ReactComponentClass<Props, State>>

interface StaticContext<Props, State> {
    target: SrcComponent<Props, State>;
    createControllable: CreateReactControllable<Props, State>;
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
        const setState: SetState<State> = (state: State) => {
            return this.setState(state)
        }
        const controllable = this._controllable = ctx.createControllable(setState, this)
        this._createElement = controllable.createElement

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

    shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
        return !shallowEqual(this.props, nextProps) || !shallowStrictEqual(this.state, nextState)
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
    createElement: Function;
}

export default class ReactComponentFactory {
    _Component: ReactComponentClass<*, *>
    createElement: CreateElement<*, *>

    constructor({Component, createElement}: React) {
        this.createElement = (createElement: any)
        this._Component = Component
    }

    wrapComponent<Props, State>(
        target: SrcComponent<Props, State>,
        createControllable: CreateReactControllable<Props, State>
    ): ReactComponentClass<Props, State> {
        class WrappedComponent extends (this._Component: any)<Props, State> {
            static displayName: string = `${debugName(target)}`
            static __rdiCtx: StaticContext<Props, State> = {
                target,
                createControllable
            }
            state: State
            props: Props
        }
        Object.assign((WrappedComponent.prototype: Object), ComponentMixin.prototype)
        return WrappedComponent
    }
}
if (0) ((new ReactComponentFactory(...(0: any))): ComponentFactory)
