// @flow

import type {IHasForceUpdate, ICreateElement, IConsumerFactory, IConsumerListener} from '../atoms/interfaces'

interface IReact<Component> {
    Component: Component;
    createElement: any;
}

export default class ReactComponentFactory<Element: React$Element<any>, Component: ReactClass<*>> {
    createElement: ICreateElement<Element>
    _Component: Function

    constructor(react: IReact<Component>) {
        this.createElement = (react.createElement: any)

        this._Component = class WrappedComponent<Props> extends react.Component {
            static __factory: IConsumerFactory<Props, Element>

            _consumer: IConsumerListener<Props, Element, Component>
            props: Props

            componentWillMount() {
                this._consumer = this.constructor.__factory.create((this: IHasForceUpdate<Props>))
                this._consumer.willMount(this.props)
            }

            setProps(props: Props): void {
                this.props = props
            }

            componentDidMount() {
                this._consumer.didMount()
            }

            componentDidUpdate() {
                this._consumer.didUpdate()
            }

            componentWillUnmount() {
                this._consumer.willUnmount()
            }

            shouldComponentUpdate(nextProps: Props): boolean {
                return this._consumer.shouldUpdate(nextProps)
            }

            render(): Element {
                return this._consumer.render()
            }
        }
    }

    wrapComponent<Props: Object, State: Object>(
        factory: IConsumerFactory<Props, Element>
    ): Component {
        return (class WrappedComponent extends (this._Component: any)<Props, State> {
            static displayName = factory.displayName
            static __factory = factory
        }: any)
    }
}
