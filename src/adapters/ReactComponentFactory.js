// @flow
import type {
    ComponentFactory,
    CreateElement,
    SrcComponent,
    SetState
} from 'reactive-di/interfaces/component'
import debugName from 'reactive-di/utils/debugName'
import shallowEqual, {shallowStrictEqual} from 'reactive-di/utils/shallowEqual'
import ComponentControllable from 'reactive-di/core/ComponentControllable'
import {DepInfo} from 'reactive-di/core/common'

type ReactComponent<Props, State> = React$Component<*, Props, State>
type ReactComponentClass<Props, State> = Class<ReactComponent<Props, State>>

interface StaticContext<Props, State> {
    info: DepInfo<SrcComponent<Props, State>, *>;
    createElement: CreateElement<*, *>;
}

// <State: Object, Props: Object>
const ComponentMixin = {
    // static __rdiCtx: StaticContext<Props, State>
    // setState: (state: State) => void
    // state: ?State
    // props: Props
    //
    // _target: SrcComponent<Props, ?State>
    // _controllable: IComponentControllable<State, ReactComponentClass<Props, State>>
    // _createElement: ReactCreateElement

    componentWillMount<Props, State>(): void {
        const ctx: StaticContext<Props, State> = this.constructor.__rdiCtx
        const t = this
        const setState: SetState<State> = (state: State) => {
            return t.setState(state)
        }
        const controllable = this._controllable = new ComponentControllable(ctx.info, setState)
        this._createElement = controllable.contextify(ctx.createElement)

        this.state = controllable.getState()
        this._target = ctx.info.target
        this._controllable.onWillMount((this: any))
    },

    componentDidMount() {
        this._controllable.onMount()
    },

    componentDidUpdate<Props, State>(_props: Props, _state: State): void {
        this._controllable.onUpdate((this: any))
    },

    componentWillUnmount(): void {
        this._controllable.onUnmount()
    },

    shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
        return !shallowEqual(this.props, nextProps) || !shallowStrictEqual(this.state, nextState)
    },

    render(): any {
        return this._target(this.props, this.state, this._createElement)
    }
}

const ComponentDevMixin = {
    _showError(e: Error): void {
        console.error(e) // eslint-disable-line
    },

    shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
        return ComponentMixin.shouldComponentUpdate.call(this, nextProps, nextState)
    },

    componentWillMount(): void {
        try {
            ComponentMixin.componentWillMount.call(this)
        } catch (e) {
            this._showError(e)
            throw e
        }
    },

    componentDidUpdate(): void {
        try {
            ComponentMixin.componentDidUpdate.call(this)
        } catch (e) {
            this._showError(e)
            throw e
        }
    },

    componentDidMount(): void {
        try {
            ComponentMixin.componentDidMount.call(this)
        } catch (e) {
            this._showError(e)
            throw e
        }
    },

    componentWillUnmount(): void {
        try {
            ComponentMixin.componentWillUnmount.call(this)
        } catch (e) {
            this._showError(e)
            throw e
        }
    },

    render(): void {
        try {
            return ComponentMixin.render.call(this)
        } catch (e) {
            this._showError(e)
            throw e
        }
    }
}

interface React {
    Component: ReactComponentClass<*, *>;
    createElement: Function;
}

export default class ReactComponentFactory {
    _Component: ReactComponentClass<*, *>
    _createElement: CreateElement<*, *>
    _mixin: Object

    constructor({Component, createElement}: React, isDebug?: boolean) {
        this._createElement = (createElement: any)
        this._Component = Component
        this._mixin = isDebug ? ComponentDevMixin : ComponentMixin
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
        Object.assign((WrappedComponent.prototype: Object), this._mixin)
        return WrappedComponent
    }
}
if (0) ((new ReactComponentFactory(...(0: any))): ComponentFactory) // eslint-disable-line
