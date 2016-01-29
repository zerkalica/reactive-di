/* @flow */

import createPureCursorCreator from './model/pure/createPureCursorCreator'
import AnnotationResolverImpl from './core/AnnotationResolverImpl'
import ReactiveDiImpl from './core/ReactiveDiImpl'
import SymbolMetaDriver from './drivers/SymbolMetaDriver'
import type {
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
        return new AnnotationResolverImpl(
            new SymbolMetaDriver(),
            middlewares,
            createPureCursorCreator(state),
            notifier,
            plugins
        )
    }

    return new ReactiveDiImpl(createResolver)
}
