/* @flow */

import type {
    Tag,
    DependencyKey,
    Annotation
} from 'reactive-di/i/coreInterfaces'

import type {
    Provider,
    Plugin,
    RelationUpdater,
    CreateContainer,
    ContainerProps,
    ContainerHelper,
    Container,
    ContainerManager
} from 'reactive-di/i/coreInterfaces'

import normalizeMiddlewares from 'reactive-di/core/normalizeMiddlewares'
import normalizeConfiguration from 'reactive-di/core/normalizeConfiguration'
import SimpleMap from 'reactive-di/utils/SimpleMap'
import getFunctionName from 'reactive-di/utils/getFunctionName'
import driver from 'reactive-di/core/annotationDriver'
import createPluginsMap from 'reactive-di/utils/createPluginsMap'
import createDefaultContainer from 'reactive-di/core/createDefaultContainer'
import defaultPlugins from 'reactive-di/plugins/defaultPlugins'
import createDummyRelationUpdater from 'reactive-di/core/updaters/createDummyRelationUpdater'

// implements ContainerManager, ContainerHelper
class DefaultContainerManager {
    _createContainer: CreateContainer;

    _annotations: Map<DependencyKey, Annotation>;
    _cache: Map<DependencyKey, Provider>;
    _plugins: Map<string, Plugin>;

    _containers: Array<Container>;
    _middlewares: Map<DependencyKey|Tag, Array<DependencyKey>>;
    _updater: RelationUpdater;

    constructor(
        annotations: Map<DependencyKey, Annotation>,
        plugins: Map<string, Plugin>,
        updater: RelationUpdater,
        createContainer: CreateContainer
    ) {
        this._createContainer = createContainer

        this._annotations = annotations
        this._cache = new SimpleMap()
        this._plugins = plugins

        this._containers = []
        this._middlewares = new SimpleMap()
        this._updater = updater
    }

    setMiddlewares(
        raw?: Array<[DependencyKey, Array<Tag|DependencyKey>]>
    ): ContainerManager {
        this._middlewares = normalizeMiddlewares(raw || [])
        return this
    }

    /**
     * @see ContainerHelper interface
     */
    removeContainer(container: Container): void {
        this._containers = this._containers.filter((target) => target !== container)
    }

    /**
     * @see ContainerHelper interface
     */
    createProvider(annotatedDep: DependencyKey, isParent: boolean): ?Provider {
        let provider: ?Provider = this._cache.get(annotatedDep);

        if (provider) {
            return provider
        }

        let annotation: ?Annotation = this._annotations.get(annotatedDep);
        if (!annotation) {
            if (!isParent) {
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

        provider = plugin.create(annotation)
        this._cache.set(annotatedDep, provider)

        return provider
    }

    createContainer(parent?: Container): Container {
        const props: ContainerProps = {
            helper: (this: ContainerHelper),
            middlewares: this._middlewares,
            updater: this._updater,
            parent
        };

        const container: Container = this._createContainer(props);
        this._containers.push(container)

        return container
    }

    _delete(oldDep: DependencyKey): void {
        const cache = this._cache
        const provider: ?Provider = cache.get(oldDep);
        if (provider) {
            const containers = this._containers
            const k = containers.length
            const dependants = provider.getDependants()
            for (let i = 0, l = dependants.length; i < l; i++) {
                const target = dependants[i].annotation.target
                cache.delete(target)
                for (let j = 0; j < k; j++) {
                    containers[j].delete(target)
                }
            }
        }
    }

    replace(oldDep: DependencyKey, newDep?: DependencyKey|Annotation): void {
        this._delete(oldDep)
        if (newDep && this._annotations.has(oldDep)) {
            const annotation: ?Annotation = typeof newDep === 'object'
                ? (newDep: Annotation)
                : driver.getAnnotation((newDep: Dependency));

            if (annotation) {
                this._annotations.set(oldDep, annotation)
            }
        }
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
 * import {createManagerFactory} from 'reactive-di'
 * import {klass} from 'reactive-di/providers'
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
 * const configFactory = createManagerFactory()
 * const config = configFactory([
 *   klass(Engine),
 *   klass(Car, Engine)
 * ])
 * const container = config.createContainer()
 * const car: Car = container.get(Car);
 *
 * assert(car instanceof Car)
 * assert(car.engine instanceof Engine)
 * ```
 */
export default function createManagerFactory(
    pluginsConfig?: Array<Plugin> = defaultPlugins,
    createUpdater?: () => RelationUpdater = createDummyRelationUpdater,
    createContainer?: CreateContainer = createDefaultContainer
): (config?: Array<Annotation>) => ContainerManager {
    const plugins: Map<string, Plugin> = createPluginsMap(pluginsConfig);

    return function createContainerManager(
        config?: Array<Annotation> = []
    ): ContainerManager {
        return new DefaultContainerManager(
            normalizeConfiguration(config),
            plugins,
            createUpdater(),
            createContainer
        );
    }
}
