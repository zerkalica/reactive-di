// @flow

import type {IComponentFactory} from './consumer/interfaces'
import Notifier from './hook/Notifier'
import Computed from './computed/Computed'

import type {IContext, IStaticContext} from './commonInterfaces'

import type {SheetFactory} from './theme/interfaces'

import RelationBinder from './RelationBinder'
import Di from './Di'
import type {ILogger} from './hook/interfaces'
import type {IControllable} from './source/interfaces'
import Updater from './source/Updater'

export type IOpts<Component, Element> = {
    values?: {[id: string]: any};
    defaultErrorComponent: Function;
    themeFactory: SheetFactory,
    componentFactory: IComponentFactory<Component, Element>;
    debug?: boolean;
    logger?: Class<ILogger>;
    updater?: Class<IControllable>;
}

export default class DiFactory<Component, Element> {
    _staticContext: IStaticContext<Component, Element>
    _loggerKey: ?Function

    constructor(opts: IOpts<Component, Element>) {
        const values = opts.values || {}
        values.AbstractSheetFactory = opts.themeFactory
        this._loggerKey = opts.logger || null
        const context: IStaticContext<Component, Element> = this._staticContext = {
            defaultErrorComponent: opts.defaultErrorComponent,
            notifier: new Notifier(),
            componentFactory: opts.componentFactory,
            binder: new RelationBinder(values),
            protoFactory: null,
            Updater: opts.updater || Updater
        }
        if (opts.debug) {
            context.protoFactory = (new Di('proto', [], this._staticContext, []): IContext)
        }
    }

    create(): Di<Component, Element> {
        const di = new Di('root', [], this._staticContext, [])
        if (this._loggerKey) {
            const logger = this._staticContext.notifier.logger = new Computed(this._loggerKey, di)
            logger.resolve()
        }

        return di
    }

    setProto(from: Function, to: Function): void {
        if (!this._staticContext.protoFactory) {
            throw new Error('setProto enabled only in debug mode')
        }
        this._staticContext.protoFactory.resolveSource(from).set(to)
    }
}
