/* @flow */
import type {
    Tag,
    Dependency,
    Annotation
} from 'reactive-di/i/annotationInterfaces'

import type {
    Provider,
    Plugin,
    ResolveDepsResult,
    CreateResolverOptions,
    RelationUpdater
} from 'reactive-di/i/nodeInterfaces'

import ResolveHelper from 'reactive-di/core/ResolveHelper'
import createDepResolverCreator from 'reactive-di/core/createDepResolverCreator'
import getFunctionName from 'reactive-di/utils/getFunctionName'
import driver from 'reactive-di/core/annotationDriver'
import SimpleMap from 'reactive-di/utils/SimpleMap'

export default class DiContext {
    _cache: Map<Dependency, Provider>;
    _plugins: Map<string, Plugin>;
    _annotations: Map<Dependency, Annotation>;
    _parent: ?DiContext;

    _updater: RelationUpdater;

    createDepResolver: (rec: CreateResolverOptions, tags: Array<Tag>) => () => ResolveDepsResult;

    constructor(
        plugins: Map<string, Plugin>,
        updater: RelationUpdater,
        annotations: Map<Dependency, Annotation>,
        middlewares: Map<Dependency|Tag, Array<Dependency>>,
        parent: ?DiContext = null
    ) {
        this._cache = new SimpleMap()
        this._plugins = plugins
        this._updater = updater
        this._parent = parent || null
        this._annotations = annotations

        const helper = new ResolveHelper(
            middlewares,
            this
        )

        this.createDepResolver = createDepResolverCreator(helper)
    }

    replace(annotatedDep: Dependency, annotation?: Annotation): void {
        const rc = this._cache
        const provider: ?Provider = rc.get(annotatedDep);
        if (provider) {
            const parents = provider.getParents()
            for (let i = 0, l = parents.length; i < l; i++) {
                rc.delete(parents[i].annotation.target)
            }
        } else if (this._parent && !this._annotations.has(annotatedDep)) {
            this._parent.replace(annotatedDep)
        }
        if (annotation) {
            this._annotations.set(annotatedDep, annotation)
        }
    }

    _createProvider(annotatedDep: Dependency): ?Provider {
        let annotation: ?Annotation = this._annotations.get(annotatedDep);
        if (!annotation) {
            if (!this._parent) {
                annotation = driver.get(annotatedDep)
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
        provider.init(this)
        this._updater.end(provider)

        return provider
    }

    getProvider(annotatedDep: Dependency): Provider {
        let provider: ?Provider = this._cache.get(annotatedDep);
        if (!provider) {
            provider = this._createProvider(annotatedDep);
            if (!provider) {
                if (!this._parent) {
                    throw new Error(`Can't find annotation for ${getFunctionName(annotatedDep)}`)
                }
                provider = this._parent.getProvider(annotatedDep)
            }
            this._cache.set(annotatedDep, provider)
        } else {
            this._updater.inheritRelations(provider)
        }

        return provider
    }
}
