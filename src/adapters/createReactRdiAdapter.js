// @flow
import type {ICreateComponent, IComponentFn, RdiProps} from '../consumer/interfaces'

const ComponentMixin = {
    // __consumer: IConsumerProps<Props, Element>
    // props: Props

    componentWillMount() {
        this.__consumer.onComponentWillMount()
    },

    componentWillUnmount() {
        this.__consumer.onComponentWillUnmount()
    },

    shouldComponentUpdate(nextProps: Object): boolean {
        return this.__consumer.onComponentShouldUpdate(nextProps)
    },

    render(): Element {
        return this.__consumer.render()
    }
}

export default function createReactRdiAdapter(component: Function): ICreateComponent {
    const methods = Object.assign({}, component.prototype, ComponentMixin)

    return function wrapComponent(displayName: string): IComponentFn {
        function WrappedComponent(props: RdiProps, context?: Object) {
            const consumer = this.__consumer = props._rdi
            consumer.init(this, props)
            if (!consumer.hasHooks) {
                this.componentWillUnmount = undefined
                this.componentWillMount = undefined
            }
            component.call(this, props, context)
        }
        WrappedComponent.displayName = displayName
        WrappedComponent.prototype = Object.create(methods)
        WrappedComponent.prototype.constructor = WrappedComponent

        return WrappedComponent
    }
}
