/* @flow */

import createPureCursorCreator from './model/pure/createPureCursorCreator'
import setupStateAnnotations from './model/pure/setupStateAnnotations'
import AnnotationResolverImpl from './core/AnnotationResolverImpl'
import ReactiveDiImpl from './core/ReactiveDiImpl'
import SymbolMetaDriver from './drivers/SymbolMetaDriver'
import ClassPlugin from './plugins/class/ClassPlugin'
import FactoryPlugin from './plugins/factory/FactoryPlugin'
import LoaderPlugin from './plugins/loader/LoaderPlugin'
import MetaPlugin from './plugins/meta/MetaPlugin'
import ModelPlugin from './plugins/model/ModelPlugin'
import SetterPlugin from './plugins/setter/SetterPlugin'

import type {
    AnnotationDriver,
    DepId,
    Dependency,
    Tag
} from './annotationInterfaces'
import type {
    Notifier,
    SimpleMap,
    CursorCreator
} from './modelInterfaces'
import type {
    ReactiveDi,
    DependencyResolver
} from './nodeInterfaces'
import type {Plugin} from './pluginInterfaces'

function createPureStateDi(
    plugins: SimpleMap<string, Plugin>,
    middlewares: SimpleMap<DepId|Tag, Array<Dependency>>,
    state: Object
): ReactiveDi {
    function createResolver(notifier: Notifier): DependencyResolver {
        const driver: AnnotationDriver = new SymbolMetaDriver();
        setupStateAnnotations(driver, state)

        return new AnnotationResolverImpl(
            driver,
            middlewares,
            createPureCursorCreator(state),
            notifier,
            {
                class: new ClassPlugin(),
                factory: new FactoryPlugin(),
                loader: new LoaderPlugin(),
                setter: new SetterPlugin(),
                model: new ModelPlugin(),
                meta: new MetaPlugin()
            }
        )
    }

    return new ReactiveDiImpl(createResolver)
}
