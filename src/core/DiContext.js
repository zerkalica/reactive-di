/* @flow */
import type {
    Tag,
    Dependency,
    Annotation
} from 'reactive-di/i/annotationInterfaces'

import type {
    Resolver,
    Provider,
    ResolverCacheRec,
    Plugin,
    ResolveDepsResult,
    CreateResolverOptions,
    RelationUpdater
} from 'reactive-di/i/nodeInterfaces'

import ResolveHelper from 'reactive-di/core/ResolveHelper'
import createDepResolverCreator from 'reactive-di/core/createDepResolverCreator'
import getFunctionName from 'reactive-di/utils/getFunctionName'
import driver from 'reactive-di/core/annotationDriver'

export default class DiContext {
    _resolverCache: Map<Dependency, ResolverCacheRec>;
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
        this._resolverCache = new Map()
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
        const rc = this._resolverCache
        const cr: ?ResolverCacheRec = rc.get(annotatedDep);
        if (cr) {
            const parents = cr.provider.getParents()
            for (let i = 0, l = parents.length; i < l; i++) {
                rc.clear(parents[i].annotation.target)
            }
        } else if (this._parent && !this._annotations.has(annotatedDep)) {
            this._parent.replace(annotatedDep)
        }
        if (annotation) {
            this._annotations.set(annotatedDep, annotation)
        }
    }

    _createProvider(annotation: Annotation): Provider {
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

    _createCacheRec(annotatedDep: Dependency): ?Provider {
        let annotation: ?Annotation = this._annotations.get(annotatedDep);
        if (annotation) {
            return this._createProvider(annotation)
        }

        if (!this._parent) {
            annotation = driver.get(annotatedDep)
            if (annotation) {
                return this._createProvider(annotation)
            }
        }
    }

    _getCached(annotatedDep: Dependency): ResolverCacheRec {
        let cr: ?ResolverCacheRec = this._resolverCache.get(annotatedDep);
        if (!cr) {
            const provider: ?Provider = this._createCacheRec(annotatedDep);
            if (!provider) {
                if (!this._parent) {
                    throw new Error(`Can't find annotation for ${getFunctionName(annotatedDep)}`)
                }
                cr = this._parent._getCached(annotatedDep)
            } else {
                cr = {
                    provider,
                    resolver: provider.createResolver()
                }
            }
            this._resolverCache.set(annotatedDep, cr)
        } else {
            this._updater.inheritRelations(cr.provider)
        }

        return cr
    }

    getResolver(annotatedDep: Dependency): Resolver {
        return this._getCached(annotatedDep).resolver
    }
}
