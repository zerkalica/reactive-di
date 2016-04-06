/* @flow */
import type {
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
        if (pluginsConfig) {
            this._context = new DiContext(
                createPluginsMap(pluginsConfig)
            )
        } else {
            if (!context) {
                throw new Error('Context not passed to constructor of ReactiveDi')
            }
            this._context = context
        }
    }

    replace(annotatedDep: Dependency, annotation?: Annotation): void {
        this._context.replace(annotatedDep, annotation)
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
