// @flow
import type {
    ComponentFactory,
    CreateElement,
    SrcComponent,
    IComponentControllable,
    CreateControllable,
    SetState
} from 'reactive-di/interfaces/component'
import type {IContext} from 'reactive-di/interfaces/internal'
import debugName from 'reactive-di/utils/debugName'
import shallowEqual, {shallowStrictEqual} from 'reactive-di/utils/shallowEqual'
import ComponentControllable from 'reactive-di/core/ComponentControllable'
import {DepInfo} from 'reactive-di/core/common'

type ReactElement = React$Element<any>
type ReactComponent<Props, State> = React$Component<*, Props, State>
type ReactComponentClass<Props, State> = Class<ReactComponent<Props, State>>

type ReactCreateElement = CreateElement<any, ReactElement>
type CreateReactControllable<Props, State> = CreateControllable<State, ReactComponentClass<Props, State>>

interface StaticContext<Props, State> {
    info: DepInfo<SrcComponent<Props, State>, *>;
    createElement: CreateElement<*, *>;
}

const dp = Object.defineProperty

class ComponentMixin<State: Object, Props: Object> {
    static __rdiCtx: StaticContext<Props, State>
    setState: (state: State) => void

    state: ?State
    props: Props

    _target: SrcComponent<Props, ?State>
    _controllable: IComponentControllable<State, ReactComponentClass<Props, State>>
    _createElement: ReactCreateElement

    componentWillMount(): void {
        const ctx: StaticContext<Props, State> = this.constructor.__rdiCtx
        const setState: SetState<State> = (state: State) => {
            return this.setState(state)
        }
        const controllable = this._controllable = new ComponentControllable(ctx.info, setState)
        this._createElement = controllable.contextify(ctx.createElement)

        const state: ?State = this.state = controllable.getState()
        this._target = ctx.info.target
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
    _createElement: CreateElement<*, *>

    constructor({Component, createElement}: React) {
        this._createElement = (createElement: any)
        this._Component = Component
    }

    wrapComponent<Props, State>(
        info: DepInfo<SrcComponent<Props, State>, *>
    ): ReactComponentClass<Props, State> {
        const createElement = this._createElement
        class WrappedComponent extends (this._Component: any)<Props, State> {
            static displayName: string = `${debugName(info.target)}`
            static __rdiCtx: StaticContext<Props, State> = {
                info,
                createElement
            }
            state: State
            props: Props
        }
        Object.assign((WrappedComponent.prototype: Object), ComponentMixin.prototype)
        return WrappedComponent
    }
}
if (0) ((new ReactComponentFactory(...(0: any))): ComponentFactory)
