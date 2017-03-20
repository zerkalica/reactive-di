// @flow

import type {IContext} from '../commonInterfaces'
import debugName from '../utils/debugName'

import type {
    IComponentFn,
    IConsumerProps,
    IConsumerMeta
} from './interfaces'

import ConsumerState from './ConsumerState'

const emptyObj = {}

export default class ConsumerFactory<
    Props: Object,
    State: Object,
    Element
> {
    displayName: string
    id: number
    context: IContext

    _cached: ?ConsumerState<Props, State, Element>
    _meta: IConsumerMeta
    _needResolve: boolean

    component: IComponentFn

    constructor(
        key: Function,
        context: IContext
    ) {
        const componentMeta = key._rdiCmp || emptyObj
        const name = key.displayName || debugName(key)

        const id = key._r0 || ++context.notifier.lastId // eslint-disable-line
        key._r0 = id // eslint-disable-line
        const meta: IConsumerMeta = this._meta = {
            id,
            name,
            key,
            args: key._r1 || null,
            propsTo: componentMeta.propsTo || null,
            register: componentMeta.register || null
        }

        this.id = meta.id
        this.displayName = meta.name
        this.context = context
        if (meta.register) {
            this._needResolve = false
            this._cached = null
        } else {
            this._cached = new ConsumerState(this._meta, context)
            this._needResolve = true
        }
        this.component = context.createComponent(name)
    }

    create(parentId: number): IConsumerProps<Props, Element> {
        if (this._needResolve && this._cached) {
            this._needResolve = false
            this._cached.resolve(this.context.binder)
        }

        return this._cached
            ? this._cached.create(parentId)
            : new ConsumerState(
                this._meta,
                this.context
                    .copy(this.displayName)
                    .register(this._meta.register)
            )
                .resolve(this.context.binder)
                .create(parentId)
    }
}
