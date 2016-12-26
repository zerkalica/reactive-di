// @flow

import type {
    IContext,
    IConsumer,
    IConsumerFactory,
    IHasForceUpdate,
    IConsumerListener,
    IConsumerMeta
} from './interfaces'

import Consumer from './Consumer'

export default class ConsumerFactory<V, Element, Component> {
    displayName: string
    id: number
    component: Component
    context: IContext

    _cached: ?IConsumer<V, Element>
    _meta: IConsumerMeta

    constructor(
        meta: IConsumerMeta,
        context: IContext
    ) {
        this.id = meta.id
        this.displayName = meta.name
        this._meta = meta
        this.context = context
        this._cached = meta.register
            ? null
            : new Consumer(this._meta, context)
        this.component = context.componentFactory.wrapComponent(
            (this: IConsumerFactory<any, Element>)
        )
    }

    create(updater: IHasForceUpdate, props: V): IConsumerListener<V, Element, Component> {
        const listener = this._cached
            ? this._cached.create(updater)
            : (new Consumer(
                this._meta,
                this.context.copy(this.displayName).register(this._meta.register)
            )).create(updater)

        listener.willMount(props)

        return listener
    }
}
