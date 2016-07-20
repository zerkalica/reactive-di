// @flow

import type {
    Adapter,
    Atom,
    Derivable,
    CreateWidget,
    SrcComponent,
    CreateComponentReactor
} from '../interfaces'

import derivableAtomAdapter from './derivableAtomAdapter'
import debugName from '../utils/debugName'
type ReactComponent<Props, State> = React$Component<*, Props, State>
type CreateReactWidget<Props, State> = CreateWidget<Props, State, Class<ReactComponent<Props, State>>>

const dp = Object.defineProperty

function createReactWidget<Props, State>(
    RC: Class<ReactComponent<Props, State>>,
    findDOMElement: (component: ReactComponent<Props, State>) => HTMLElement,
    adapter: Adapter,
    Target: Class<SrcComponent<Props, State>>,
    atom: Derivable<[State]>,
    CreateComponentReactor: CreateComponentReactor
): any {
    return class WrappedComponent extends RC {
        static displayName: string = `wrap@${debugName(Target)}`;
        state: State;
        props: Props;
        _target: Target;

        _setState = ([state]: [State]) => this.setState(state);
        _unmounted: Atom<boolean>;

        componentWillMount(): void {
            this.state = atom.get()[0]
            const target: Target = this._target = new Target(this.state)
            target.props = this.props
            target.state = this.state
            dp(target, '$', {
                get: () => findDOMElement(this)
            })
            this._unmounted = adapter.atom(false)
        }

        componentDidMount() {
            atom.react(this._setState, {
                skipFirst: true,
                until: this._unmounted
            })
            CreateComponentReactor(this._unmounted)

            const target =  this._target
            if (target.componentDidMount) {
                target.props = this.props
                target.state = this.state
                target.componentDidMount()
            }
        }

        componentDidUpdate(props: Props, state: State): void {
            const target =  this._target
            if (target.componentDidUpdate) {
                target.props = this.props
                target.state = this.state
                target.componentDidUpdate(props, state)
            }
        }

        componentWillUnmount(): void {
            this._unmounted.set(true)
            const target =  this._target
            if (target.componentWillUnmount) {
                target.props = this.props
                target.state = this.state
                target.componentWillUnmount()
            }
        }

        render() {
            const target = this._target
            target.props = this.props
            target.state = this.state
            return target.render()
        }
    }
}

export default function createReactWidgetFactory<Props, State>(
    ReactComponent: Class<ReactComponent<Props, State>>,
    findDOMElement: (component: ReactComponent<Props, State>) => HTMLElement,
    adapter: Adapter = derivableAtomAdapter
): CreateReactWidget<Props, State> {
    return (
        Target: Class<SrcComponent<Props, State>>,
        atom: Derivable<[State]>,
        CreateComponentReactor: CreateComponentReactor
    ) => createReactWidget(ReactComponent, findDOMElement, adapter, Target, atom, CreateComponentReactor)
}
