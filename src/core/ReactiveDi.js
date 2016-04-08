/* @flow */
import type {
    Dependency,
    Annotation
} from 'reactive-di/i/annotationInterfaces'

import type {
    Plugin,
    RelationUpdater
} from 'reactive-di/i/nodeInterfaces'

import createPluginsMap from 'reactive-di/core/createPluginsMap'
import DiContext from 'reactive-di/core/DiContext'
import normalizeConfiguration from 'reactive-di/core/normalizeConfiguration'

export default class ReactiveDi {
    _context: DiContext;
    _plugins: Map<string, Plugin>;
    _createUpdater: () => RelationUpdater;

    constructor(
        pluginsConfig: Array<Plugin>|Map<string, Plugin>,
        createUpdater: () => RelationUpdater,
        config: Array<Annotation> = [],
        parent: ?DiContext = null
    ) {
        this._createUpdater = createUpdater
        if (Array.isArray(pluginsConfig)) {
            this._plugins = createPluginsMap(pluginsConfig)
        } else {
            this._plugins = pluginsConfig
        }
        this._context = this._createContext(config, parent)
    }

    replace(annotatedDep: Dependency, annotation?: Annotation): void {
        this._context.replace(annotatedDep, annotation)
    }

    _createContext(config: Array<Annotation>, parent: ?DiContext): DiContext {
        const {annotations, middlewares} = normalizeConfiguration(config)

        return new DiContext(
            this._plugins,
            this._createUpdater(),
            annotations,
            middlewares,
            parent
        )
    }

    create(config: Array<Annotation>): ReactiveDi {
        return new ReactiveDi(
            this._plugins,
            this._createUpdater,
            config,
            this._context
        )
    }

    get(annotatedDep: Dependency): any {
        return this._context.getProvider(annotatedDep).resolve()
    }
}
