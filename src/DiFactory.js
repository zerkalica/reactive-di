// @flow

import type {
    IContext,
    IStaticContext,
    IComponentFactory,
    IKey,
    IMiddlewares,
    IErrorHandler
} from './atoms/interfaces'

import type {SheetFactory} from './theme/interfaces'

import DisposableCollection from './atoms/DisposableCollection'
import DepFactory from './atoms/DepFactory'
import Transact from './atoms/Transact'
import RelationBinder from './atoms/RelationBinder'
import Di from './Di'

export type IOpts<Component, Element> = {
    values?: {[id: string]: any};
    defaultErrorComponent: IKey;
    errorHandler?: IErrorHandler;
    themeFactory: SheetFactory,
    componentFactory: IComponentFactory<Component, Element>;
    debug?: boolean;
    middlewares?: IMiddlewares;
}

class DefaultErrorHandler {
    setError(e: Error): void {
        console.error(e) // eslint-disable-line
    }
}

export default class DiFactory<Component, Element> {
    _staticContext: IStaticContext<Component, Element>

    constructor(opts: IOpts<Component, Element>) {
        const values = opts.values || {}
        values.AbstractSheetFactory = opts.themeFactory
        const context: IStaticContext<Component, Element> = this._staticContext = {
            depFactory: new DepFactory(values, opts.defaultErrorComponent),
            notifier: new Transact(opts.middlewares || null),
            componentFactory: opts.componentFactory,
            binder: new RelationBinder(),
            errorHandler: opts.errorHandler || new DefaultErrorHandler(),
            protoFactory: null,
            contexts: opts.debug ? new DisposableCollection() : null
        }
        if (opts.debug) {
            context.protoFactory = (new Di('proto', [], this._staticContext, []): IContext)
        }
    }

    create(): Di<Component, Element> {
        return new Di('root', new Map(), this._staticContext, [])
    }

    setState<V>(id: number, value: V): void {
        if (!this._staticContext.contexts) {
            throw new Error('setState enabled only in debug mode')
        }
        const contexts = this._staticContext.contexts.items
        for (let i = 0; i < contexts.length; i++) {
            const context = contexts[i]
            if (!context.closed) {
                context.set(id, value)
            }
        }
    }

    setProto(from: Function, to: Function): void {
        if (!this._staticContext.protoFactory) {
            throw new Error('setProto enabled only in debug mode')
        }
        this._staticContext.protoFactory.resolveSource(from).set(to)
    }
}
