/* @flow */

import createPureCursorCreator from 'reactive-di/model/pure/createPureCursorCreator'
import AnnotationResolverImpl from 'reactive-di/core/AnnotationResolverImpl'

import SymbolMetaDriver from 'reactive-di/drivers/SymbolMetaDriver'

import type {
    Annotation,
    AnnotationDriver,
    Dependency,
    Tag
} from 'reactive-di/i/annotationInterfaces'
import type {AnnotationResolver} from 'reactive-di/i/nodeInterfaces'
import type {GetDep} from 'reactive-di/i/diInterfaces'
import type {SimpleMap} from 'reactive-di/i/modelInterfaces'
import type {Plugin} from 'reactive-di/i/pluginInterfaces'

function createPluginsMap(plugins: Array<Plugin>): SimpleMap<string, Plugin> {
    const pluginMap = {}
    for (let i = 0, l = plugins.length; i < l; i++) {
        pluginMap[plugins[i].kind] = plugins[i]
    }
    return pluginMap
}

export default function createPureStateDi<T: Object>(
    state: T,
    deps: Array<Annotation>,
    plugins: Array<Plugin>,
    middlewares?: Map<Dependency|Tag, Array<Dependency>>
): GetDep {
    const driver: AnnotationDriver = new SymbolMetaDriver();
    const resolver: AnnotationResolver = new AnnotationResolverImpl(
        driver,
        middlewares || new Map(),
        new Map(deps.map((dep: Annotation) => ([dep.target, dep]))),
        createPureCursorCreator(driver, state),
        createPluginsMap(plugins)
    );
    resolver.resolve(state.constructor)

    return function getDep<V>(annotatedDep: Dependency<V>): V {
        return ((resolver.resolve(annotatedDep).resolve(): any): V)
    }
}
