/* @flow */
import type {
    SimpleMap,
    Dependency,
    Annotation
} from 'reactive-di/i/annotationInterfaces'

import type {
    Plugin
} from 'reactive-di/i/nodeInterfaces'
import type {
    Context
} from 'reactive-di/i/nodeInterfaces'

import createPluginsMap from 'reactive-di/core/createPluginsMap'
import DiContext from 'reactive-di/core/DiContext'

export default class ReactiveDi {
    _context: Context;

    constructor(
        pluginsConfig: ?Array<Plugin>,
        context?: Context
    ) {
        let plugins: SimpleMap<string, Plugin> = {};
        if (pluginsConfig) {
            plugins = createPluginsMap(pluginsConfig)
        }
        this._context = context || new DiContext(plugins)
    }

    create(config: Array<Annotation>): ReactiveDi {
        return new ReactiveDi(
            null,
            this._context.create(config)
        )
    }

    get(annotatedDep: Dependency): any {
        return this._context.getResolver(annotatedDep).resolve()
    }
}
