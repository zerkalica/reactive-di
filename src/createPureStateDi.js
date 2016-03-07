/* @flow */

import createPureCursorCreator from 'reactive-di/model/pure/createPureCursorCreator'
import AnnotationResolverImpl from 'reactive-di/core/AnnotationResolverImpl'

import DefaultIdCreator from 'reactive-di/core/DefaultIdCreator'
import driver from 'reactive-di/pluginsCommon/driver'

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
import type {AliasAnnotation} from 'reactive-di/i/plugins/aliasInterfaces'

function createPluginsMap(plugins: Array<Plugin>): SimpleMap<string, Plugin> {
    const pluginMap: SimpleMap<string, Plugin> = {};
    for (let i = 0, l = plugins.length; i < l; i++) {
        pluginMap[plugins[i].kind] = plugins[i]
    }
    return pluginMap
}

class AnnotationMap<K: Function, A: Annotation> extends Map<K, A> {
    _driver: AnnotationDriver;

    constructor(
        deps: Array<Annotation>,
        drv: AnnotationDriver
    ) {
        super()
        for (let i = 0, l = deps.length; i < l; i++) {
            const annotation: Annotation|AliasAnnotation = deps[i];
            switch (annotation.kind) {
                case 'alias':
                    this.set(((annotation: any): AliasAnnotation).source, annotation.target)
                    break
                default:
                    this.set(annotation.target, (annotation: any))
                    break
            }
        }
        this._driver = drv
    }

    has(key: K): boolean {
        if (!super.has(key)) {
            return this._driver.hasAnnotation(key)
        }
        return true
    }

    get/*:: <V: Annotation> */(key: K): V|void { // eslint-disable-line
        let value: ?V = (super.get(key): any);
        if (!value) {
            value = this._driver.getAnnotation(key)
            if (value) {
                this.set(key, value)
            }
        }

        return value
    }
}

export default function createPureStateDi<T: Object>(
    state: T,
    deps: Array<Annotation>,
    plugins: Array<Plugin>,
    middlewares?: Map<Dependency|Tag, Array<Dependency>>
): GetDep {
    const map: Map<Function, Annotation> = new AnnotationMap(deps, driver);
    const resolver: AnnotationResolver = new AnnotationResolverImpl(
        middlewares || new Map(),
        map,
        createPureCursorCreator(map, state),
        createPluginsMap(plugins),
        new DefaultIdCreator()
    );
    resolver.resolve(state.constructor)

    return function getDep<D>(annotatedDep: Dependency<D>): D {
        return ((resolver.resolve(annotatedDep).resolve(): any): D)
    }
}
