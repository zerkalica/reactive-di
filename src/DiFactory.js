// @flow

import Notifier from './source/Notifier'
import Computed from './computed/Computed'

import type {IContext, IStaticContext} from './commonInterfaces'

import type {SheetFactory} from './theme/interfaces'
import type {CreateVNode} from './adapters/inferno'

import RelationBinder from './RelationBinder'
import Di from './Di'
import type {ILogger} from './source/interfaces'
import type {ICreateComponent} from './consumer/interfaces'

export type IOpts = {
    values?: {[id: string]: any};
    themeFactory?: SheetFactory,
    debug?: boolean;
    createVNode: CreateVNode;
    createComponent: ICreateComponent;
    logger?: Class<ILogger>;
}

export default class DiFactory {
    _staticContext: IStaticContext
    _loggerKey: ?Function

    constructor(opts: IOpts) {
        const values = opts.values || {}
        values.AbstractSheetFactory = opts.themeFactory
        this._loggerKey = opts.logger || null
        const context: IStaticContext = this._staticContext = {
            notifier: new Notifier(),
            createVNode: opts.createVNode,
            binder: new RelationBinder(),
            protoFactory: null,
            values,
            createComponent: opts.createComponent
        }
        if (opts.debug) {
            context.protoFactory = (new Di('proto', [], this._staticContext, []): IContext)
        }
    }

    create(): Di {
        const sc = this._staticContext
        const di = new Di('root', [], sc, [])
        if (this._loggerKey) {
            const logger = sc.notifier._logger = new Computed(this._loggerKey, di)
            logger.resolve(sc.binder)
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
