/* @flow */

import createPureCursorCreator from './model/pure/createPureCursorCreator'
import setupStateAnnotations from './model/pure/setupStateAnnotations'
import AnnotationResolverImpl from './core/AnnotationResolverImpl'
import ClassPlugin from './plugins/class/ClassPlugin'
import FactoryPlugin from './plugins/factory/FactoryPlugin'
import LoaderPlugin from './plugins/loader/LoaderPlugin'
import MetaPlugin from './plugins/meta/MetaPlugin'
import ModelPlugin from './plugins/model/ModelPlugin'
import ReactiveDiImpl from './core/ReactiveDiImpl'
import SetterPlugin from './plugins/setter/SetterPlugin'
import SymbolMetaDriver from './drivers/SymbolMetaDriver'
import type {
    AnnotationDriver,
    DepId,
    Dependency,
    Tag
} from './interfaces/annotationInterfaces'
import type {
    Notify,
    SimpleMap,
    CursorCreator
} from './interfaces/modelInterfaces'
import type {
    ReactiveDi,
    AnnotationResolver
} from './interfaces/nodeInterfaces'
import type {Plugin} from './interfaces/pluginInterfaces'

function createPureStateDi(
    state: Object,
    middlewares?: Map<Dependency|Tag, Array<Dependency>>,
    overrides?: Map<Dependency, Dependency>
): ReactiveDi {
    function createResolver(notify: Notify): AnnotationResolver {
        const driver: AnnotationDriver = new SymbolMetaDriver();
        setupStateAnnotations(driver, state)

        return new AnnotationResolverImpl(
            driver,
            middlewares || new Map(),
            overrides || new Map(),
            createPureCursorCreator(state),
            notify,
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
