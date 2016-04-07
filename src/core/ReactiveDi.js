/* @flow */
import type {
    Dependency,
    Annotation
} from 'reactive-di/i/annotationInterfaces'

import type {
    Plugin
} from 'reactive-di/i/nodeInterfaces'

import createPluginsMap from 'reactive-di/core/createPluginsMap'
import DiContext from 'reactive-di/core/DiContext'
import normalizeConfiguration from 'reactive-di/core/normalizeConfiguration'

import HotRelationUpdater from 'reactive-di/core/updaters/HotRelationUpdater'
import DummyRelationUpdater from 'reactive-di/core/updaters/DummyRelationUpdater'

export default class ReactiveDi {
    _context: DiContext;
    _isHotReload: boolean;
    _plugins: Map<string, Plugin>;

    constructor(
        pluginsConfig: Array<Plugin>|Map<string, Plugin>,
        config: Array<Annotation> = [],
        isHotReload: boolean = false,
        parent: ?DiContext = null
    ) {
        this._isHotReload = isHotReload
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
            this._isHotReload
                ? new HotRelationUpdater()
                : new DummyRelationUpdater(),
            annotations,
            middlewares,
            parent
        )
    }

    create(config: Array<Annotation>): ReactiveDi {
        return new ReactiveDi(
            this._plugins,
            config,
            this._isHotReload,
            this._context
        )
    }

    get(annotatedDep: Dependency): any {
        return this._context.getResolver(annotatedDep).resolve()
    }
}
