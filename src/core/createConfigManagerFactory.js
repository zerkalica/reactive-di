/* @flow */

import type {
    Tag,
    DependencyKey,
    Annotation
} from 'reactive-di/i/coreInterfaces'

import type {
    ContainerManager,
    Container,
    Resolver,
    Provider,
    Plugin,
    RelationUpdater
} from 'reactive-di/i/coreInterfaces'

import type {
    CreateContainer,
    ProviderManager
} from 'reactive-di/core/createDefaultContainer'

import normalizeMiddlewares from 'reactive-di/core/normalizeMiddlewares'
import normalizeConfiguration from 'reactive-di/core/normalizeConfiguration'
import SimpleMap from 'reactive-di/utils/SimpleMap'
import getFunctionName from 'reactive-di/utils/getFunctionName'
import driver from 'reactive-di/core/annotationDriver'
import createPluginsMap from 'reactive-di/utils/createPluginsMap'
import createDefaultContainer from 'reactive-di/core/createDefaultContainer'
import defaultPlugins from 'reactive-di/plugins/defaultPlugins'
import createDummyRelationUpdater from 'reactive-di/core/updaters/createDummyRelationUpdater'

// implements ProviderManager, ContainerManager
class DefaultProviderManager {
    _annotations: Map<DependencyKey, Annotation>;
    _cache: Map<DependencyKey, Provider>;
    _plugins: Map<string, Plugin>;
    _updater: RelationUpdater;

    _middlewares: Map<DependencyKey|Tag, Array<DependencyKey>>;
    _resolverCaches: Array<Map<DependencyKey, Resolver>>;
    _createContainer: CreateContainer;

    constructor(
        config: Array<Annotation>,
        plugins: Map<string, Plugin>,
        updater: RelationUpdater,
        createContainer: CreateContainer
    ) {
        this._annotations = normalizeConfiguration(config)
        this._middlewares = new SimpleMap()
        this._createContainer = createContainer
        this._cache = new SimpleMap()
        this._plugins = plugins
        this._updater = updater
        this._resolverCaches = []
    }

    _createProvider(annotatedDep: DependencyKey, container: Container): ?Provider {
        let annotation: ?Annotation = this._annotations.get(annotatedDep);
        if (!annotation) {
            if (!this._parent) {
                annotation = driver.getAnnotation((annotatedDep: Dependency))
                if (!annotation) {
                    return null
                }
            } else {
                return null
            }
        }

        const plugin: ?Plugin = this._plugins.get(annotation.kind);
        if (!plugin) {
            throw new Error(
                `Provider not found for annotation ${getFunctionName(annotation.target)}`
            )
        }

        const provider: Provider = plugin.create(annotation);
        this._updater.begin(provider)
        provider.init(container)
        this._updater.end(provider)

        return provider
    }

    setMiddlewares(
        raw?: Array<[DependencyKey, Array<Tag|DependencyKey>]>
    ): ContainerManager {
        this._middlewares = normalizeMiddlewares(raw || [])
        return this
    }

    createContainer(parent?: Container): Container {
        return this._createContainer(
            (this: ProviderManager),
            this._middlewares,
            parent
        )
    }

    addCacheHandler(cache: Map<DependencyKey, Resolver>): void {
        this._resolverCaches.push(cache)
    }

    removeCacheHandler(cache: Map<DependencyKey, Resolver>): void {
        this._resolverCaches = this._resolverCaches.filter((target) => target !== cache)
    }

    replace(annotatedDep: DependencyKey, annotation?: Annotation): void {
        const cache = this._cache
        const provider: ?Provider = cache.get(annotatedDep);
        if (provider) {
            const rc = this._resolverCaches
            const k = rc.length
            const parents = provider.getParents()
            for (let i = 0, l = parents.length; i < l; i++) {
                const target = parents[i].annotation.target
                cache.delete(target)
                for (let j = 0; j < k; j++) {
                    rc[j].delete(target)
                }
            }
        }
        if (annotation) {
            this._annotations.set(annotatedDep, annotation)
        }
    }

    getProvider(annotatedDep: DependencyKey, container: Container): ?Provider {
        let provider: ?Provider = this._cache.get(annotatedDep);
        if (!provider) {
            provider = this._createProvider(annotatedDep, container);
            if (provider) {
                this._cache.set(annotatedDep, provider)
            }
        } else {
            this._updater.inheritRelations(provider)
        }

        return provider
    }
}

/**
 * Create config container manager factory for instantiating
 * new configurations and replacing dependencies.
 *
 * In typical use, in application entry point, we create config manager factory.
 * This factory creates config manager, which used for registering dependency configurations
 * and creating injection containers
 *
 * ### Example
 *
 * The following example creates an `Container` configured to create `Engine` and `Car`
 *
 * ```js
 * // @flow
 *
 * import {createConfigManagerFactory} from 'reactive-di'
 * import {klass} from 'reactive-di/configurations'
 *
 * class Engine {}
 *
 * class Car {
 *   engine: Engine;
 *
 *   constructor(engine: Engine) {
 *     this.engine = engine
 *   }
 * }
 *
 * const cmf = createConfigManagerFactory()
 * const cm = cmf([
 *   klass(Engine),
 *   klass(Car, Engine)
 * ])
 * const container = cm.createContainer()
 * const car: Car = container.get(Car);
 *
 * assert(car instanceof Car)
 * assert(car.engine instanceof Engine)
 * ```
 */
export default function createConfigManagerFactory(
    pluginsConfig?: Array<Plugin> = defaultPlugins,
    createUpdater?: () => RelationUpdater = createDummyRelationUpdater,
    createContainer?: CreateContainer = createDefaultContainer
): (config?: Array<Annotation>) => ContainerManager {
    const plugins: Map<string, Plugin> = createPluginsMap(pluginsConfig);

    return function createContainerManager(
        config?: Array<Annotation> = []
    ): ContainerManager {
        return new DefaultProviderManager(
            config,
            plugins,
            createUpdater(),
            createContainer
        );
    }
}
