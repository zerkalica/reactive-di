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

function prepareMiddlewares(
    driver: AnnotationDriver,
    raw: Array<[Dependency|Tag, Array<Dependency>]>
): SimpleMap<DepId|Tag, Array<Dependency>> {
    const middlewares: SimpleMap<DepId|Tag, Array<Dependency>> = {};
    for (let i = 0, l = raw.length; i < l; i++) {
        const [source, mdls] = raw[i];
        if (!Array.isArray(mdls)) {
            throw new TypeError('raw middleware format is not an Array<[Dependency, Array<Dependency>]>')
        }
        if (typeof source === 'string') {
            middlewares[source] = mdls
        } else {
            const {base} = driver.get(source)
            middlewares[base.id] = mdls
        }
    }
    return middlewares
}

function prepareOverrides(
    driver: AnnotationDriver,
    raw: Array<[Dependency, Dependency]>
): SimpleMap<DepId, Dependency> {
    const overrides: SimpleMap<DepId, Dependency> = {};
    for (let i = 0, l = raw.length; i < l; i++) {
        const [source, dep] = raw[i];
        const {base} = driver.get(source)
        overrides[base.id] = dep
    }
    return overrides
}

function createPureStateDi(
    middlewares: Array<[Dependency|Tag, Array<Dependency>]>,
    overrides: Array<[Dependency, Dependency]>,
    state: Object
): ReactiveDi {
    function createResolver(notifier: Notifier): DependencyResolver {
        const driver: AnnotationDriver = new SymbolMetaDriver();
        setupStateAnnotations(driver, state)

        return new AnnotationResolverImpl(
            driver,
            prepareMiddlewares(driver, middlewares),
            prepareOverrides(driver, overrides),
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
