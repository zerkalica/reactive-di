/* @flow */

import type {
    Tag,
    DependencyKey,
    RawAnnotation,
    Plugin,
    CreatePlugin
} from 'reactive-di/i/coreInterfaces'

import type {
    RelationUpdater,
    Container,
    ContainerManager
} from 'reactive-di/i/coreInterfaces'

import normalizeMiddlewares from 'reactive-di/core/normalizeMiddlewares'
import AnnotationMap from 'reactive-di/core/AnnotationMap'
import SimpleMap from 'reactive-di/utils/SimpleMap'
import {
    rdi
} from 'reactive-di/core/annotationDriver'
import createPluginsMap from 'reactive-di/utils/createPluginsMap'
import DiContainer from 'reactive-di/core/DiContainer'
import defaultPlugins from 'reactive-di/plugins/defaultPlugins'
import createDummyRelationUpdater from 'reactive-di/core/updaters/createDummyRelationUpdater'

// implements ContainerManager, ContainerHelper
class DefaultContainerManager {
    _annotations: AnnotationMap;
    _plugins: Map<string, Plugin>;

    _containers: Array<Container>;
    _middlewares: Map<DependencyKey|Tag, Array<DependencyKey>>;
    _updater: RelationUpdater;

    constructor(
        annotations: AnnotationMap,
        plugins: Map<string, Plugin>,
        updater: RelationUpdater
    ) {
        this._annotations = annotations
        this._plugins = plugins
        this._updater = updater

        this._containers = []
        this._middlewares = new SimpleMap()
    }

    setMiddlewares(
        raw?: Array<[DependencyKey, Array<Tag|DependencyKey>]>
    ): ContainerManager {
        this._middlewares = normalizeMiddlewares(raw || [])
        return this
    }

    createContainer(parent?: Container, initState?: Array<[DependencyKey, any]>): Container {
        let container: Container;
        const self = this

        function dispose(): void {
            self._containers = self._containers.filter((target) => target !== container)
        }

        container = new DiContainer(
            dispose,
            this._middlewares,
            this._updater,
            this._plugins,
            this._annotations,
            parent,
            new SimpleMap(initState || [])
        );
        this._containers.push(container)

        return container
    }

    _delete(oldDep: DependencyKey): void {
        const containers = this._containers
        const k = containers.length
        for (let j = 0; j < k; j++) {
            containers[j].delete(oldDep)
        }
    }

    replace(oldDep: DependencyKey, newDep?: DependencyKey|Annotation): void {
        this._delete(oldDep)
        if (newDep && this._annotations.has(oldDep)) {
            const annotation: ?RawAnnotation = typeof newDep === 'object'
                ? (newDep: Annotation)
                : rdi.get((newDep: Dependency));

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
    pluginsConfig?: Array<CreatePlugin> = defaultPlugins,
    createUpdater?: () => RelationUpdater = createDummyRelationUpdater
): (config?: Array<RawAnnotation|DependencyKey>) => ContainerManager {
    let plugins: Map<string, Plugin>;
    const updater = createUpdater()

    function createContainerManager(
        config?: Array<RawAnnotation|DependencyKey> = []
    ): ContainerManager {
        return new DefaultContainerManager(
            new AnnotationMap(config),
            plugins,
            updater
        );
    }
    plugins = createPluginsMap(createContainerManager, pluginsConfig)


    return createContainerManager
}
