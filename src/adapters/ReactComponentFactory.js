// @flow

import type {IHasForceUpdate, ICreateElement, IConsumerFactory} from '../atoms/interfaces'

interface IReact<Component> {
    Component: Component;
    createElement: any;
}

const ComponentMixin = {
    // static __factory: IConsumerFactory<Props, Element>
    // _consumer: IConsumerListener<Props, Element, Component>
    // props: Props

    componentWillMount() {
        this._consumer = this.constructor.__factory.create((this: IHasForceUpdate<Object>))
        this._consumer.willMount(this.props)
    },

    setProps(props: Object): void {
        this.props = props
    },

    componentDidMount() {
        this._consumer.didMount()
    },

    componentDidUpdate() {
        this._consumer.didUpdate()
    },

    componentWillUnmount() {
        this._consumer.willUnmount()
    },

    shouldComponentUpdate(nextProps: Object): boolean {
        return this._consumer.shouldUpdate(nextProps)
    },

    render(): Element {
        return this._consumer.render()
    }
}

export default class ReactComponentFactory<Element: React$Element<any>, TComponent: ReactClass<*>> {
    createElement: ICreateElement<Element>
    _Component: Function
    _ComponentProto: Object

    constructor({createElement, Component}: IReact<TComponent>) {
        this.createElement = (createElement: any)
        this._ComponentProto = Object.assign({}, Component.prototype, ComponentMixin)
        this._Component = Component
    }

    wrapComponent<Props: Object>(
        factory: IConsumerFactory<Props, Element>
    ): TComponent {
        const component = this._Component
        function WrappedComponent(props: Props, context?: Object) {
            component.call(this, props, context)
        }
        WrappedComponent.displayName = factory.displayName
        WrappedComponent.__factory = factory
        WrappedComponent.prototype = Object.create(this._ComponentProto)
        WrappedComponent.prototype.constructor = WrappedComponent
        return (WrappedComponent: any)
    }
}
