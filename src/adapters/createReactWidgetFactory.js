// @flow
import type {
    Adapter,
    Atom,
    Derivable
} from '../interfaces/atom'
import type {
    CreateWidget,
    SrcComponent
} from '../interfaces/component'

import derivableAtomAdapter from './derivableAtomAdapter'
import debugName from '../utils/debugName'
type ReactComponent<Props, State> = React$Component<*, Props, State>
type CreateReactWidget<Props, State> = CreateWidget<Props, State, Class<ReactComponent<Props, State>>>

const dp = Object.defineProperty

function shallowEqual(objA: Object, objB: Object): boolean {
    if (objA === objB) {
        return true
    }

    if (typeof objA !== 'object' || objA === null ||
        typeof objB !== 'object' || objB === null) {
        return false
    }

    var keysA = Object.keys(objA)
    var keysB = Object.keys(objB)

    if (keysA.length !== keysB.length) {
        return false
    }

    // Test for A's keys different from B.
    var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB)
    for (var i = 0; i<keysA.length; i++) {
        if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
            return false
        }
    }

    return true
}

function createReactWidget<Props: Object, State: Object> (
    RC: Class<ReactComponent<Props, State>>,
    findDOMElement: (component: ReactComponent<Props, State> ) => HTMLElement,
    adapter: Adapter,
    Target: Class<SrcComponent<Props, State>>,
    stateAtom: Derivable<[State]>,
    isMounted: Atom<boolean>
): any {
    return class WrappedComponent extends RC {
        static displayName: string = `${debugName(Target)}`;
        state: State
        props: Props
        _target: Target

        _setState = ([state]: [State]) => this.setState(state);
        _unmounted: Atom<boolean>;

        componentWillMount(): void {
            this.state = stateAtom.get()[0]
            const target: Target = this._target = new Target(this.state)
            target.props = this.props
            target.state = this.state
            dp(target, '$', {
                get: () => findDOMElement(this)
            })
            this._unmounted = adapter.atom(false)
        }

        componentDidMount() {
            stateAtom.react(this._setState, {
                skipFirst: true,
                until: this._unmounted
            })
            isMounted.set(true)

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
            isMounted.set(false)
            this._unmounted.set(true)
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

        shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
            return (
                !shallowEqual(this.props, nextProps) ||
                !shallowEqual(this.state, nextState)
            )
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
}

export default function createReactWidgetFactory<Props:  Object, State: Object> (
    ReactComponent: Class<ReactComponent<Props, State>>,
    findDOMElement: (component: ReactComponent<Props, State> ) => HTMLElement,
    adapter: Adapter = derivableAtomAdapter
): CreateReactWidget<Props, State> {
    return (
        Target: Class<SrcComponent<Props, State>>,
        stateAtom: Derivable<[State]>,
        isMounted: Atom<boolean>
    ) => createReactWidget(
        ReactComponent,
        findDOMElement,
        adapter,
        Target,
        stateAtom,
        isMounted
    )
}
