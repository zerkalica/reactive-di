// @flow
import type {
    CreateWidget,
    SrcComponent,
    CreateControllable,
    IComponentControllable
} from 'reactive-di/interfaces/component'

import debugName from 'reactive-di/utils/debugName'
import shallowEqual from 'reactive-di/utils/shallowEqual'

type ReactComponent<Props, State> = React$Component<*, Props, State>
type FindElement<Props, State> = (component: ReactComponent<Props, State>) => HTMLElement
interface StaticContext<Props, State> {
    findDOMElement: FindElement<Props, State>;
    Target: Class<SrcComponent<Props, State>>;
    createControllable: CreateControllable<State>;
}

const dp = Object.defineProperty

class ComponentMixin<State: Object, Props: Object> {
    static __rdiCtx: StaticContext<Props, State>
    setState: (state: State) => void

    state: State
    props: Props
    _target: SrcComponent<Props, State>
    _controllable: IComponentControllable<State>

    componentWillMount(): void {
        const ctx = this.constructor.__rdiCtx
        const setState: (state: State) => void = (state: State) => this.setState(state)
        this._controllable = ctx.createControllable(setState)
        this.state = this._controllable.getState()
        const target: SrcComponent<Props, State> = this._target = new ctx.Target(this.state)
        target.props = this.props
        target.state = this.state
        dp(target, '$', {
            get: () => ctx.findDOMElement((this: any))
        })
    }

    componentDidMount() {
        this._controllable.onMount()
        const target = this._target
        if (target.componentDidMount) {
            target.props = this.props
            target.state = this.state
            try {
                target.componentDidMount()
            } catch (err) {
                console.error(err)
                throw err
            }
        }
    }

    componentDidUpdate(props: Props, state: State): void {
        const target = this._target
        if (target.componentDidUpdate) {
            target.props = this.props
            target.state = this.state
            try {
                target.componentDidUpdate(props, state)
            } catch (err) {
                console.error(err)
                throw err
            }
        }
    }

    componentWillUnmount(): void {
        this._controllable.onUnmount()
        const target = this._target
        if (target.componentWillUnmount) {
            target.props = this.props
            target.state = this.state
            try {
                target.componentWillUnmount()
            } catch (err) {
                console.error(err)
                throw err
            }
        }
    }

    shouldComponentUpdate(nextProps: Object): boolean {
        return !shallowEqual(this.props, nextProps)
    }

    render(): React$Element<*> {
        const target = this._target
        target.props = this.props
        target.state = this.state
        let result: React$Element<*>
            try {
                result = target.render(this.props, this.state)
            } catch (err) {
                console.error(err)
                throw err
            }

        return result
    }
}

export default function createReactWidgetFactory<Props:  Object, State: Object> (
    RC: Class<ReactComponent<Props, State>>,
    findDOMElement: FindElement<Props, State>
): CreateWidget<Props, State, Class<ReactComponent<Props, State>>> {
    return function createReactWidgetImpl(
        Target: Class<SrcComponent<Props, State>>,
        createControllable: CreateControllable<State>
    ): Class<ReactComponent<Props, State>> {
        class WrappedComponent extends RC {
            static displayName: string = `${debugName(Target)}`
            static __rdiCtx: StaticContext<Props, State> = {
                findDOMElement,
                Target,
                createControllable
            }

            state: State
            props: Props
        }
        (Object: any).assign(WrappedComponent.prototype, ComponentMixin.prototype)
        return WrappedComponent
    }
}
