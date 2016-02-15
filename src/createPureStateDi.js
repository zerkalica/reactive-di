/* @flow */

import createPureCursorCreator from './model/pure/createPureCursorCreator'
import AnnotationResolverImpl from './core/AnnotationResolverImpl'
import AsyncModelPlugin from './plugins/asyncmodel/AsyncModelPlugin'
import ClassPlugin from './plugins/class/ClassPlugin'
import FactoryPlugin from './plugins/factory/FactoryPlugin'
import GetterPlugin from './plugins/getter/GetterPlugin'
import LoaderPlugin from './plugins/loader/LoaderPlugin'
import MetaPlugin from './plugins/meta/MetaPlugin'
import ModelPlugin from './plugins/model/ModelPlugin'
import ReactiveDiImpl from './core/ReactiveDiImpl'
import ResetPlugin from './plugins/loader/ResetPlugin'
import SetterPlugin from './plugins/setter/SetterPlugin'
import SymbolMetaDriver from './drivers/SymbolMetaDriver'
import type {
    AnnotationDriver,
    Dependency,
    Tag
} from './interfaces/annotationInterfaces'
import type {ReactiveDi} from './interfaces/diInterfaces'
import type {AnnotationResolver} from './interfaces/nodeInterfaces'
import type {FactoryAnnotator} from './plugins/factory/factoryInterfaces'

export default function createPureStateDi<T: Object>(
    state: T,
    factoryAnnotator: FactoryAnnotator,
    middlewares?: Map<Dependency|Tag, Array<Dependency>>,
    overrides?: Map<Dependency, Dependency>
): ReactiveDi {
    function createResolver(): AnnotationResolver {
        const driver: AnnotationDriver = new SymbolMetaDriver();

        const resolver: AnnotationResolver = new AnnotationResolverImpl(
            driver,
            middlewares || new Map(),
            overrides || new Map(),
            createPureCursorCreator(driver, state),
            {
                class: new ClassPlugin(),
                factory: new FactoryPlugin(),
                setter: new SetterPlugin(),
                getter: new GetterPlugin(),
                model: new ModelPlugin(),
                loader: new LoaderPlugin(),
                reset: new ResetPlugin(),
                asyncmodel: new AsyncModelPlugin(),
                meta: new MetaPlugin()
            }
        );
        resolver.resolve(state.constructor)
        return resolver
    }

    return new ReactiveDiImpl(createResolver, factoryAnnotator)
}
