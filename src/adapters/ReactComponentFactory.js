// @flow

import type {ISetProps, ICreateElement, IConsumerFactory} from '../consumer/interfaces'

interface IReact<Component> {
    Component: Component;
    createElement: any;
}

const ComponentMixin = {
    // static __factory: IConsumerFactory<Props, Element>
    // _consumer: IConsumerListener<Props, Element, Component>
    // props: Props

    componentWillMount() {
        this._consumer = this.__factory.create((this: ISetProps<Object>))
        this._consumer.willMount(this.props)
    },

    setProps(props: Object): void {
        this.props = props
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
        factory: IConsumerFactory<Props, Element, *>
    ): TComponent {
        const component = this._Component
        function WrappedComponent(props: Props, context?: Object) {
            component.call(this, props, context)
            this.__factory = factory
        }

        WrappedComponent.displayName = factory.displayName
        WrappedComponent.prototype = Object.create(this._ComponentProto)
        WrappedComponent.prototype.constructor = WrappedComponent

        return (WrappedComponent: any)
    }
}
