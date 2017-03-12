// @flow

import type {IContext} from '../commonInterfaces'
import debugName from '../utils/debugName'

import type {
    ISetProps,
    IConsumerFactory,
    IConsumerListener,
    IConsumerMeta
} from './interfaces'

import ConsumerCollection from './ConsumerCollection'

const emptyObj = {}

export default class ConsumerFactory<
    Props: Object,
    State: Object,
    Element,
    Component
> {
    displayName: string
    id: number
    component: Component

    context: IContext
    _cached: ?ConsumerCollection<Props, State, Element>
    _meta: IConsumerMeta

    constructor(
        key: Function,
        context: IContext
    ) {
        (this: IConsumerFactory<Props, Element, Component>) // eslint-disable-line
        const componentMeta = key._rdiCmp || emptyObj
        const name = key._rdiKey || debugName(key)

        const id = key._rdiId || ++context.binder.lastId // eslint-disable-line
        key._rdiId = id // eslint-disable-line
        context.items[id] = this
        const meta: IConsumerMeta = this._meta = {
            id,
            name,
            key,
            args: key._rdiArg || null,
            propsTo: componentMeta.propsTo || null,
            errorComponent: key === context.defaultErrorComponent
                ? null
                : componentMeta.onError || null,
            register: componentMeta.register || null
        }

        this.id = meta.id
        this.displayName = meta.name
        this.context = context
        this._cached = meta.register
            ? null
            : new ConsumerCollection(this._meta, context)
        this.component = context.componentFactory.wrapComponent(
            (this: IConsumerFactory<Props, Element, Component>)
        )
    }

    create(updater: ISetProps<Props>): IConsumerListener<Props, Element> {
        return this._cached
            ? this._cached.create(updater)
            : (new ConsumerCollection(
                this._meta,
                this.context.copy(this.displayName).register(this._meta.register)
            )).create(updater)
    }
}
